import { useQuery } from '@tanstack/react-query';
import {
  getRdoAnalyticsProdutividade,
  getRdoAnalyticsMotivos,
  getRdoTimeline,
  getRdoTimelineMotivos,
  getRdoComparativo,
  getRdoEficiencia,
  getRdoFiltrosOpcoes,
  getRdoRanking,
  getRdoOvertimeRanking,
} from '@/api/rdo-analytics';
import type { RdoDetalhesParams } from '@/types/rdo-types';

export function useRdoProdutividade(
  params: Omit<RdoDetalhesParams, 'page'> & { limit?: number },
) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'produtividade', params],
    queryFn: () => getRdoAnalyticsProdutividade(params),
    staleTime: 60 * 1000,
  });
}

export function useRdoMotivos(
  params: Omit<RdoDetalhesParams, 'page'> & { limit?: number },
) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'motivos', params],
    queryFn: () => getRdoAnalyticsMotivos(params),
    staleTime: 60 * 1000,
  });
}

export function useRdoTimeline(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'timeline', params],
    queryFn: () => getRdoTimeline(params),
    staleTime: 60_000,
  });
}

export function useRdoTimelineMotivos(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'timeline', 'motivos', params],
    queryFn: () => getRdoTimelineMotivos(params),
    staleTime: 60_000,
  });
}

export function useRdoComparativo(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'comparativo', params],
    queryFn: () => getRdoComparativo(params),
    staleTime: 60_000,
  });
}

export function useRdoEficiencia(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'eficiencia', params],
    queryFn: () => getRdoEficiencia(params),
    staleTime: 60_000,
  });
}

export function useRdoFiltrosOpcoes(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'filtros-opcoes', params],
    queryFn: () => getRdoFiltrosOpcoes(params),
    staleTime: 5 * 60_000,
  });
}

export function useRdoRanking(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'ranking', params],
    queryFn: () => getRdoRanking(params),
    staleTime: 60_000,
  });
}

export function useRdoOvertimeRanking(
  params: Record<string, string | number> = {},
) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'overtime-ranking', params],
    queryFn: () => getRdoOvertimeRanking(params),
    staleTime: 60_000,
  });
}
