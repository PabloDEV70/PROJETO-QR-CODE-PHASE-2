import { apiClient } from '@/api/client';
import type { LoginResponse, MeResponse } from '@/types/auth-types';

export async function loginSupervisor(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return data;
}

export async function refreshToken(
  token: string,
): Promise<{ token: string; refreshToken: string }> {
  const { data } = await apiClient.post<{
    token: string;
    refreshToken: string;
  }>('/auth/refresh', { refreshToken: token });
  return data;
}

export async function getMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me');
  return data;
}
