import { apiClient } from '@/api/client';
import type {
  EmTempoRealItem,
  EmTempoRealResumo,
  NotaDetalheCompleta,
} from '@/types/em-tempo-real-types';

export async function getEmTempoRealMovimentacoes(): Promise<EmTempoRealItem[]> {
  const { data } = await apiClient.get<EmTempoRealItem[]>(
    '/em-tempo-real/movimentacoes',
  );
  return data;
}

export async function getEmTempoRealResumo(): Promise<EmTempoRealResumo> {
  const { data } = await apiClient.get<EmTempoRealResumo>(
    '/em-tempo-real/resumo',
  );
  return data;
}

export async function getNotaDetalhe(nunota: number): Promise<NotaDetalheCompleta> {
  const { data } = await apiClient.get<NotaDetalheCompleta>(
    `/em-tempo-real/${nunota}`,
  );
  return data;
}
