import { apiClient, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/${codparc}/foto?token=${token}`;
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/foto/${codemp}/${codfunc}?token=${token}`;
}


export interface FuncionarioListaItem {
  codparc: number;
  nomeparc: string;
  temFoto: boolean;
  departamento: string | null;
  cargo: string | null;
}

export interface FuncionarioListaResponse {
  data: FuncionarioListaItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function listarFuncionarios(
  params: Record<string, string | number>,
): Promise<FuncionarioListaResponse> {
  const { data } = await apiClient.get<FuncionarioListaResponse>(
    '/funcionarios/listar',
    { params },
  );
  return data;
}
