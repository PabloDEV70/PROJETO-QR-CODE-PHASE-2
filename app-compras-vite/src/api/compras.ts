import { apiClient } from '@/api/client';
import type { RequisicaoItem, CotacaoItem, ComprasResumo } from '@/types/compras-types';

export async function getRequisicoesPendentes(
  tipo: 'compras' | 'manutencao' = 'compras',
): Promise<RequisicaoItem[]> {
  const { data } = await apiClient.get<RequisicaoItem[]>('/compras/requisicoes', {
    params: { tipo },
  });
  return Array.isArray(data) ? data : [];
}

export async function getCotacoesPendentes(): Promise<CotacaoItem[]> {
  const { data } = await apiClient.get<CotacaoItem[]>('/compras/cotacoes');
  return Array.isArray(data) ? data : [];
}

export async function getComprasResumo(): Promise<ComprasResumo> {
  const { data } = await apiClient.get<ComprasResumo>('/compras/resumo');
  return data;
}
