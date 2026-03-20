import { apiClient } from '@/api/client';
import type { OsDetalhadaCompleta } from '@/types/os-detalhada-types';

export async function fetchOsDetalhada(nuos: number): Promise<OsDetalhadaCompleta> {
  const { data } = await apiClient.get<OsDetalhadaCompleta>(`/os-detalhada/${nuos}`);
  return data;
}
