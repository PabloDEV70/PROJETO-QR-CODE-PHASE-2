import { apiClient } from '@/api/client';
import type {
  RdoDetalhesParams,
  RdoAnalyticsResumo,
  RdoAnalyticsProdutividade,
  RdoAnalyticsEficiencia,
  RdoTimelinePoint,
  RdoComparativo,
  RdoFiltrosOpcoes,
  RdoHoraExtraAggregate,
  RdoAssiduidadeAggregate,
} from '@/types/rdo-types';
import type {
  RdoTimelineMotivoRow,
  RdoAnomalia,
  RdoMotivosResponse,
  ColabRanking,
  ColabOvertimeRanking,
} from '@/types/rdo-analytics-types';

export async function getRdoAnalyticsResumo(
  params: Omit<RdoDetalhesParams, 'page' | 'limit'> = {},
): Promise<RdoAnalyticsResumo> {
  const { data } = await apiClient.get<RdoAnalyticsResumo>(
    '/rdo/analytics/resumo',
    { params },
  );
  return data;
}

export async function getRdoAnalyticsProdutividade(
  params: Omit<RdoDetalhesParams, 'page'> & { limit?: number } = {},
): Promise<RdoAnalyticsProdutividade[]> {
  const { data } = await apiClient.get<{ data: RdoAnalyticsProdutividade[] }>(
    '/rdo/analytics/produtividade',
    { params },
  );
  return data.data;
}

export async function getRdoAnalyticsMotivos(
  params: Omit<RdoDetalhesParams, 'page'> & { limit?: number } = {},
): Promise<RdoMotivosResponse> {
  const { data } = await apiClient.get<RdoMotivosResponse>(
    '/rdo/analytics/motivos',
    { params },
  );
  return data;
}

export async function getRdoTimeline(
  params: Record<string, string | number> = {},
): Promise<RdoTimelinePoint[]> {
  const { data } = await apiClient.get<RdoTimelinePoint[]>(
    '/rdo/analytics/timeline',
    { params },
  );
  return data;
}

export async function getRdoTimelineMotivos(
  params: Record<string, string | number> = {},
): Promise<RdoTimelineMotivoRow[]> {
  const { data } = await apiClient.get<RdoTimelineMotivoRow[]>(
    '/rdo/analytics/timeline/motivos',
    { params },
  );
  return data;
}

export async function getRdoComparativo(
  params: Record<string, string | number> = {},
): Promise<RdoComparativo> {
  const { data } = await apiClient.get<RdoComparativo>(
    '/rdo/analytics/comparativo',
    { params },
  );
  return data;
}

export async function getRdoEficiencia(
  params: Record<string, string | number> = {},
): Promise<RdoAnalyticsEficiencia[]> {
  const res = await apiClient.get<{ data: RdoAnalyticsEficiencia[] }>(
    '/rdo/analytics/eficiencia',
    { params },
  );
  return res.data.data;
}

export async function getRdoFiltrosOpcoes(
  params: Record<string, string | number> = {},
): Promise<RdoFiltrosOpcoes> {
  const { data } = await apiClient.get<RdoFiltrosOpcoes>(
    '/rdo/analytics/filtros-opcoes',
    { params },
  );
  return data;
}

export async function getRdoHoraExtra(
  params: Record<string, string | number> = {},
): Promise<RdoHoraExtraAggregate> {
  const { data } = await apiClient.get<RdoHoraExtraAggregate>(
    '/rdo/analytics/hora-extra',
    { params },
  );
  return data;
}

export async function getRdoAssiduidade(
  params: Record<string, string | number> = {},
): Promise<RdoAssiduidadeAggregate> {
  const { data } = await apiClient.get<RdoAssiduidadeAggregate>(
    '/rdo/analytics/assiduidade',
    { params },
  );
  return data;
}

export async function getRdoAnomalias(
  params: Record<string, string | number> = {},
): Promise<RdoAnomalia[]> {
  const { data } = await apiClient.get<RdoAnomalia[]>(
    '/rdo/analytics/anomalias',
    { params },
  );
  return data;
}

export async function getRdoRanking(
  params: Record<string, string | number> = {},
): Promise<ColabRanking[]> {
  const { data } = await apiClient.get<ColabRanking[]>(
    '/rdo/analytics/ranking',
    { params },
  );
  return data;
}

export async function getRdoOvertimeRanking(
  params: Record<string, string | number> = {},
): Promise<ColabOvertimeRanking[]> {
  const { data } = await apiClient.get<ColabOvertimeRanking[]>(
    '/rdo/analytics/overtime-ranking',
    { params },
  );
  return data;
}
