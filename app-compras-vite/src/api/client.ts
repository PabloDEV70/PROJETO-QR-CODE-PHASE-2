import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';

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

/**
 * Sankhya API Mother returns {} instead of null for empty values.
 * This causes "Objects are not valid as a React child" crashes.
 * Recursively replace empty objects with null in API responses.
 */
function sanitizeEmptyObjects(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(sanitizeEmptyObjects);
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Object.keys(obj).length === 0) return null;
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      result[key] = sanitizeEmptyObjects(obj[key]);
    }
    return result;
  }
  return data;
}

apiClient.interceptors.response.use(
  (response) => {
    response.data = sanitizeEmptyObjects(response.data);
    return response;
  },
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

    const isAuthRoute = error.config?.url?.includes('/auth/');
    if ((status === 401 || status === 403) && !isAuthRoute) {
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
