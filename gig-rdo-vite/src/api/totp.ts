import { apiClient } from '@/api/client';
import type {
  LoginResponse,
  TotpSetupResponse,
  TotpStatusResponse,
} from '@/types/auth-types';

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

export const setupTotp = async (): Promise<TotpSetupResponse> => {
  const { data } = await apiClient.post<TotpSetupResponse>('/auth/totp/setup');
  return data;
};

export const verifyTotpSetup = async (code: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>('/auth/totp/verify-setup', { code });
  return data;
};

export const getTotpStatus = async (): Promise<TotpStatusResponse> => {
  const { data } = await apiClient.get<TotpStatusResponse>('/auth/totp/status');
  return data;
};

export const disableTotp = async (
  password: string,
  code: string,
): Promise<{ success: boolean }> => {
  const { data } = await apiClient.post<{ success: boolean }>('/auth/totp/disable', {
    password,
    code,
  });
  return data;
};

export const regenerateRecoveryCodes = async (): Promise<{ recoveryCodes: string[] }> => {
  const { data } = await apiClient.post<{ recoveryCodes: string[] }>('/auth/totp/recovery-codes');
  return data;
};
