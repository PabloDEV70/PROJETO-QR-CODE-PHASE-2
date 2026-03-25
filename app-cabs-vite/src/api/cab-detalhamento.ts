import { apiClient } from './client';
import type { CabDetalhamentoCompleto } from '@/types/cab-detalhamento-types';

export async function getCabDetalhamento(nunota: number): Promise<CabDetalhamentoCompleto> {
  const { data } = await apiClient.get<CabDetalhamentoCompleto>(
    `/cabs/detalhamento-completo/${nunota}`,
  );
  return data;
}
