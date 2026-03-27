import type { AuthState } from '../stores/auth-store';
import type { StoreApi, UseBoundStore } from 'zustand';

export interface ApiClientConfig {
  baseURL: string;
  authStore: UseBoundStore<StoreApi<AuthState>>;
  onUnauthorized?: () => void;
}

/**
 * Returns interceptor functions for axios.
 * Usage in each app:
 *   const { requestInterceptor, responseErrorInterceptor } = createApiInterceptors(config);
 *   apiClient.interceptors.request.use(requestInterceptor);
 *   apiClient.interceptors.response.use(r => r, responseErrorInterceptor);
 */
export function createApiInterceptors(config: ApiClientConfig) {
  const requestInterceptor = (axiosConfig: Record<string, unknown>) => {
    const { user, database } = config.authStore.getState();
    const headers = (axiosConfig.headers ?? {}) as Record<string, string>;
    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    headers['X-Database-Selection'] = database;
    return { ...axiosConfig, headers };
  };

  const responseErrorInterceptor = async (error: unknown) => {
    const err = error as { response?: { status?: number }; message?: string };
    if (!err.response) {
      (err as Record<string, string>).message = 'Sem conexao com o servidor.';
      return Promise.reject(error);
    }
    if (err.response.status === 401) {
      config.authStore.getState().logout();
      config.onUnauthorized?.();
    }
    return Promise.reject(error);
  };

  return { requestInterceptor, responseErrorInterceptor };
}
