import { apiClient } from '@/api/client';
import type { MeResponse } from '@shared/ui-lib';

export type { MeResponse };

export const getMe = async (token: string): Promise<MeResponse> => {
  const { data } = await apiClient.get<MeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
