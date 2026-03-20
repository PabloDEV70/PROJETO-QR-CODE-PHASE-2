import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}

// --- Auto-refresh token logic (app fica em televisores, token nao pode expirar) ---

function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Refresh 60s before actual expiry to avoid race conditions
    return payload.exp * 1000 < Date.now() + 60_000;
  } catch { return false; }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { user } = useAuthStore.getState();
  if (!user?.refreshToken) throw new Error('No refresh token');

  const resp = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
    refreshToken: user.refreshToken,
  });
  const data = resp.data?.data ?? resp.data;
  const newToken = data.token ?? data.access_token;
  const newRefresh = data.refreshToken;
  if (!newToken) throw new Error('Refresh failed');

  useAuthStore.getState().setUser({
    ...user,
    token: newToken,
    refreshToken: newRefresh ?? user.refreshToken,
  });
  return newToken;
}

async function ensureFreshToken(): Promise<string | null> {
  const { user } = useAuthStore.getState();
  if (!user?.token) return null;
  if (!tokenExpired(user.token)) return user.token;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// --- API Client ---

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Proactive: refresh token BEFORE request if expired
apiClient.interceptors.request.use(async (config) => {
  const { database } = useAuthStore.getState();
  config.headers['X-Database-Selection'] = database;

  const isAuthRoute = config.url?.includes('/auth/');
  if (isAuthRoute) {
    // Don't auto-refresh on auth routes themselves
    const { user } = useAuthStore.getState();
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    return config;
  }

  try {
    const token = await ensureFreshToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Refresh failed, use existing token — response interceptor will handle 401
    const { user } = useAuthStore.getState();
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Reactive: on 401, attempt one refresh + retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    if (!error.response) {
      error.message = 'Sem conexao com o servidor. Verifique sua rede.';
      return Promise.reject(error);
    }

    const { status, headers, data } = error.response;
    const original = error.config;
    const isAuthRoute = original?.url?.includes('/auth/');
    const isMutation = original?.method && ['post', 'put', 'patch', 'delete'].includes(original.method);

    if (status === 429) {
      const retryAfter = headers['retry-after'];
      const seconds = retryAfter ? Number(retryAfter) : 60;
      error.message = `Muitas tentativas. Tente novamente em ${seconds}s.`;
      return Promise.reject(error);
    }

    // 401: attempt auto-refresh + retry (once)
    if (status === 401 && !isAuthRoute && original && !(original as { _retried?: boolean })._retried) {
      (original as { _retried?: boolean })._retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        // Refresh failed
        if (isMutation) {
          error.message = 'Sessao expirada. Faca login novamente.';
          return Promise.reject(error);
        }
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // 403: no retry, just show error or redirect
    if (status === 403 && !isAuthRoute) {
      if (isMutation) {
        error.message = 'Sem permissao para esta acao.';
        return Promise.reject(error);
      }
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (data) {
      let serverMsg = data.message || data.error;
      if (serverMsg && typeof serverMsg === 'object') {
        serverMsg = serverMsg.message || serverMsg.code || JSON.stringify(serverMsg);
      }
      if (typeof serverMsg === 'string' && serverMsg) {
        error.message = serverMsg;
      }
    }

    return Promise.reject(error);
  },
);
