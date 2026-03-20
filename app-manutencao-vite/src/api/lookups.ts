import { apiClient } from '@/api/client';

export interface EmpresaOption {
  CODEMP: number;
  nome: string;
}

export async function getEmpresas(): Promise<EmpresaOption[]> {
  const { data } = await apiClient.get<EmpresaOption[]>('/man/empresas');
  return data;
}
