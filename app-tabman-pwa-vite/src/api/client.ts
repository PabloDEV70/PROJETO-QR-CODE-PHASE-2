import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useDeviceStore } from '@/stores/device-store';
import { useNotificationStore } from '@/stores/notification-store';

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Request interceptor — attach token + database header
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const { token, database } = useDeviceStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Database-Selection'] = database;
  return config;
});

// ---------------------------------------------------------------------------
// Token refresh machinery
// ---------------------------------------------------------------------------
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const { refreshToken } = useDeviceStore.getState();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<{
      token: string;
      refreshToken: string;
    }>(`${getApiBaseUrl()}/auth/refresh`, { refreshToken }, {
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });

    if (data.token) {
      useDeviceStore.getState().updateToken(data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

function refreshTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Retry helper — retries on network errors / 502 / 503 / 504
// ---------------------------------------------------------------------------
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_500;
const RETRYABLE_STATUSES = [502, 503, 504];

function isRetryable(error: AxiosError): boolean {
  if (!error.response && error.code !== 'ECONNABORTED') return true;
  if (error.response && RETRYABLE_STATUSES.includes(error.response.status)) {
    return true;
  }
  return false;
}

function getRetryCount(config: InternalAxiosRequestConfig): number {
  return (config as unknown as Record<string, number>).__retryCount ?? 0;
}

function setRetryCount(
  config: InternalAxiosRequestConfig,
  count: number,
) {
  (config as unknown as Record<string, number>).__retryCount = count;
}

// ---------------------------------------------------------------------------
// Response interceptor — Auto-refresh on 401, retry on 502, error messages
// ---------------------------------------------------------------------------
let logoutPending = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config;

    // ---- Retry on transient failures ----
    if (config && isRetryable(error)) {
      const retries = getRetryCount(config);
      if (retries < MAX_RETRIES) {
        setRetryCount(config, retries + 1);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retries + 1)));
        return apiClient(config);
      }
    }

    // ---- No response at all — offline queue for mutations ----
    if (!error.response) {
      const method = config?.method?.toLowerCase();
      if (
        config &&
        method &&
        ['post', 'put', 'delete'].includes(method)
      ) {
        const { enqueue } = await import('@/utils/offline-queue');
        await enqueue(method, config.url!, config.data);
        useNotificationStore
          .getState()
          .addToast('info', 'Salvo offline. Sincroniza ao reconectar.');
        return Promise.resolve({ data: null });
      }
      error.message = 'Servidor indisponivel. Tentando reconectar...';
      return Promise.reject(error);
    }

    const { status, headers, data } = error.response;

    // Extract server message
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      let serverMsg = d.message || d.error;
      if (serverMsg && typeof serverMsg === 'object') {
        serverMsg =
          (serverMsg as Record<string, string>).message ||
          (serverMsg as Record<string, string>).code ||
          JSON.stringify(serverMsg);
      }
      if (typeof serverMsg === 'string' && serverMsg) {
        error.message = serverMsg;
      }
    }

    // ---- 401: Try refresh, then retry original request ----
    const isAuthRoute = config?.url?.includes('/auth/');
    const alreadyRetried = (
      config as unknown as Record<string, boolean>
    )?.__isRetryAfterRefresh;

    if (status === 401 && !isAuthRoute && !alreadyRetried && config) {
      const newToken = await refreshTokenOnce();

      if (newToken) {
        (config as unknown as Record<string, boolean>).__isRetryAfterRefresh =
          true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      }

      if (!logoutPending) {
        logoutPending = true;
        useNotificationStore
          .getState()
          .addToast('error', 'Sessao expirada. Faca login novamente.');
        useDeviceStore.getState().reset();
        setTimeout(() => {
          logoutPending = false;
          window.location.href = '/setup';
        }, 1_500);
      }
      return Promise.reject(error);
    }

    // ---- 429: Rate limited ----
    if (status === 429) {
      const retryAfter = headers['retry-after'];
      const seconds = retryAfter ? Number(retryAfter) : 60;
      error.message = `Muitas tentativas. Tente novamente em ${seconds}s.`;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
