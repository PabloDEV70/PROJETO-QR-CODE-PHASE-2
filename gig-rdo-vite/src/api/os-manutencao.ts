import { apiClient } from '@/api/client';
import type { OsCompleta, OsServico } from '@/types/os-types';

export async function getOsById(nuos: number): Promise<OsCompleta> {
  const { data } = await apiClient.get<OsCompleta>(`/os-manutencao/${nuos}`);
  return data;
}

export async function getOsServicos(nuos: number): Promise<OsServico[]> {
  const { data } = await apiClient.get<OsServico[]>(
    `/os-manutencao/${nuos}/servicos`,
  );
  return data;
}
