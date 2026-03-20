import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    if (!error.response) {
      error.message = 'Sem conexao com o servidor. Verifique sua rede.';
      return Promise.reject(error);
    }

    const { status, headers, data } = error.response;

    if (status === 429) {
      const retryAfter = headers['retry-after'];
      const seconds = retryAfter ? Number(retryAfter) : 60;
      error.message = `Muitas tentativas. Tente novamente em ${seconds}s.`;
      return Promise.reject(error);
    }

    // 401/403 on non-login routes = token invalid/expired/forbidden, force logout
    const isAuthRoute = error.config?.url?.includes('/auth/');
    if ((status === 401 || status === 403) && !isAuthRoute) {
      console.error('[apiClient] 401/403 on', error.config?.method?.toUpperCase(), error.config?.url, '| status:', status, '| response:', JSON.stringify(data));
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Extract server error message for all responses
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
