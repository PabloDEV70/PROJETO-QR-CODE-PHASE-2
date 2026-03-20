import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { enqueue } from '@/utils/offline-queue';

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { user, database } = useAuthStore.getState();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  config.headers['X-Database-Selection'] = database;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const { user } = useAuthStore.getState();
  if (!user?.refreshToken) return null;
  try {
    const { data } = await axios.post<{ token: string; refreshToken: string }>(
      `${getApiBaseUrl()}/auth/refresh`,
      { refreshToken: user.refreshToken },
      { timeout: 10_000, headers: { 'Content-Type': 'application/json' } },
    );
    if (data.token) {
      useAuthStore.getState().setUser({
        ...user,
        token: data.token,
        refreshToken: data.refreshToken ?? user.refreshToken,
      });
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

function refreshTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_500;
const RETRYABLE_STATUSES = [502, 503, 504];

function isRetryable(error: AxiosError): boolean {
  if (!error.response && error.code !== 'ECONNABORTED') return true;
  if (error.response && RETRYABLE_STATUSES.includes(error.response.status)) return true;
  return false;
}

function getRetryCount(config: InternalAxiosRequestConfig): number {
  return (config as unknown as Record<string, number>).__retryCount ?? 0;
}

function setRetryCount(config: InternalAxiosRequestConfig, count: number) {
  (config as unknown as Record<string, number>).__retryCount = count;
}

// Offline queue interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response && !navigator.onLine) {
      const method = error.config?.method?.toLowerCase();
      if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
        await enqueue({
          method: method as 'post' | 'put' | 'delete' | 'patch',
          url: error.config!.url!,
          data: error.config!.data ? JSON.parse(error.config!.data as string) : undefined,
        });
        return { data: { queued: true }, status: 202, config: error.config };
      }
    }
    return Promise.reject(error);
  },
);

// Auto-refresh + retry interceptor
let logoutPending = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config;

    if (config && isRetryable(error)) {
      const retries = getRetryCount(config);
      if (retries < MAX_RETRIES) {
        setRetryCount(config, retries + 1);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retries + 1)));
        return apiClient(config);
      }
    }

    if (!error.response) {
      error.message = 'Servidor indisponivel. Tentando reconectar...';
      return Promise.reject(error);
    }

    const { status, headers, data } = error.response;

    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      let serverMsg = d.message || d.error;
      if (serverMsg && typeof serverMsg === 'object') {
        serverMsg = (serverMsg as Record<string, string>).message
          || (serverMsg as Record<string, string>).code
          || JSON.stringify(serverMsg);
      }
      if (typeof serverMsg === 'string' && serverMsg) {
        error.message = serverMsg;
      }
    }

    const isAuthRoute = config?.url?.includes('/auth/');
    const alreadyRetried = (config as unknown as Record<string, boolean>)?.__isRetryAfterRefresh;

    if (status === 401 && !isAuthRoute && !alreadyRetried && config) {
      const newToken = await refreshTokenOnce();
      if (newToken) {
        (config as unknown as Record<string, boolean>).__isRetryAfterRefresh = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      }
      if (!logoutPending) {
        logoutPending = true;
        useNotificationStore.getState().addToast('error', 'Sessao expirada. Faca login novamente.');
        useAuthStore.getState().logout();
        setTimeout(() => {
          logoutPending = false;
          window.location.href = '/login';
        }, 1_500);
      }
      return Promise.reject(error);
    }

    if (status === 429) {
      const retryAfter = headers['retry-after'];
      const seconds = retryAfter ? Number(retryAfter) : 60;
      error.message = `Muitas tentativas. Tente novamente em ${seconds}s.`;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
