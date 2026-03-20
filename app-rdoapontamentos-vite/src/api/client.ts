import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { enqueue } from '@/utils/offline-queue';

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return '/api';
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

let logoutPending = false;

// Offline mutation interceptor — queues POST/PUT/DELETE when offline
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response && !navigator.onLine) {
      const method = error.config?.method?.toLowerCase();
      if (method && ['post', 'put', 'delete'].includes(method)) {
        await enqueue({
          method: method as 'post' | 'put' | 'delete',
          url: error.config.url,
          data: error.config.data ? JSON.parse(error.config.data) : undefined,
        });
        return { data: { queued: true }, status: 202, config: error.config };
      }
    }
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    if (!error.response) {
      error.message = 'Sem conexao com o servidor. Verifique sua rede.';
      return Promise.reject(error);
    }

    const { status, headers, data } = error.response;

    // Extract server message early so it's available for all paths
    if (data) {
      let serverMsg = data.message || data.error;
      if (serverMsg && typeof serverMsg === 'object') {
        serverMsg = serverMsg.message || serverMsg.code || JSON.stringify(serverMsg);
      }
      if (typeof serverMsg === 'string' && serverMsg) {
        error.message = serverMsg;
      }
    }

    if (status === 429) {
      const retryAfter = headers['retry-after'];
      const seconds = retryAfter ? Number(retryAfter) : 60;
      error.message = `Muitas tentativas. Tente novamente em ${seconds}s.`;
      return Promise.reject(error);
    }

    const isAuthRoute = error.config?.url?.includes('/auth/');

    // 401 = token expired/invalid → logout + redirect
    if (status === 401 && !isAuthRoute) {
      useNotificationStore.getState().addToast(
        'error',
        error.message || 'Sessao expirada. Faca login novamente.',
      );
      if (!logoutPending) {
        logoutPending = true;
        useAuthStore.getState().logout();
        setTimeout(() => {
          logoutPending = false;
          window.location.href = '/login';
        }, 2500);
      }
      return Promise.reject(error);
    }

    // 403 = permission denied (NOT session expired — don't logout)
    // Let the mutation's onError handler show the toast
    if (status === 403) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
