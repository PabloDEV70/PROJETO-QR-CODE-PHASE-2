import { apiClient } from '@/api/client';
import type { LoginResponse } from '@/types/auth-types';

export const verifyTotp = async (
  totpToken: string,
  code: string,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/totp/verify', {
    totpToken,
    code,
  });
  return data;
};

export const recoverTotp = async (
  totpToken: string,
  recoveryCode: string,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/totp/recover', {
    totpToken,
    recoveryCode,
  });
  return data;
};
