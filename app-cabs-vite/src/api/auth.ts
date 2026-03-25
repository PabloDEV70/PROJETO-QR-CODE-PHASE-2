import { apiClient } from '@/api/client';
import type {
  StandardLoginPayload,
  ColaboradorLoginPayload,
  LoginResponse,
} from '@/types/auth-types';

export interface MeResponse {
  codusu: number;
  nome: string;
  nomecompleto: string | null;
  codparc: number | null;
  codgrupo: number | null;
  codemp: number | null;
  codfunc: number | null;
  pertencedp: string | null;
  nomegrupo: string | null;
}

export const loginStandard = async (
  payload: StandardLoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const loginColaborador = async (
  payload: ColaboradorLoginPayload,
): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/login/colaborador',
    payload,
  );
  return data;
};

export const getMe = async (token: string): Promise<MeResponse> => {
  const { data } = await apiClient.get<MeResponse>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
