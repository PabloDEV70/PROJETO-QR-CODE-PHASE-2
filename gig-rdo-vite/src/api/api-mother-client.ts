import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_MOTHER_URL = import.meta.env.VITE_API_MOTHER_URL || 'https://api-dbexplorer.gigantao.net';

function tokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (!parts[1]) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000 < Date.now();
  } catch { return false; }
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { user } = useAuthStore.getState();
  if (!user?.refreshToken) throw new Error('No refresh token');

  const resp = await axios.post(`${API_MOTHER_URL}/auth/refresh`, {
    refreshToken: user.refreshToken,
  });
  const data = resp.data?.data ?? resp.data;
  const newToken = data.access_token;
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

export const apiMotherClient = axios.create({
  baseURL: API_MOTHER_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

apiMotherClient.interceptors.request.use(async (config) => {
  const { database } = useAuthStore.getState();
  config.headers['X-Database'] = database;

  try {
    const token = await ensureFreshToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (refreshErr) {
    console.error('[apiMotherClient] Token refresh failed before request:', config.url, refreshErr);
    useAuthStore.getState().logout();
    window.location.href = '/login';
    return Promise.reject(new axios.Cancel('Token refresh failed'));
  }
  return config;
});

apiMotherClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retried) {
      console.error('[apiMotherClient] 401 on', original?.method?.toUpperCase(), original?.url, '| retrying with refresh...');
      original._retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiMotherClient(original);
      } catch (refreshErr) {
        console.error('[apiMotherClient] Refresh failed after 401:', refreshErr);
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

/** Execute a SELECT query directly on API Mother */
export async function executeMotherQuery<T = Record<string, unknown>>(
  sql: string,
): Promise<T[]> {
  const resp = await apiMotherClient.post('/inspection/query', { query: sql });
  return resp.data?.data?.data ?? [];
}
