import { useQuery } from '@tanstack/react-query';
import {
  getRdoAnalyticsResumo,
  getRdoAnalyticsProdutividade,
  getRdoAnalyticsMotivos,
  getRdoTimeline,
  getRdoTimelineMotivos,
  getRdoComparativo,
  getRdoEficiencia,
  getRdoFiltrosOpcoes,
  getRdoRanking,
  getRdoOvertimeRanking,
  getRdoAnomalias,
} from '../api/rdo-analytics';
import { CACHE_TIMES } from '@/config/query-config';

export function useRdoResumoAnalytics(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'resumo', params],
    queryFn: () => getRdoAnalyticsResumo(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoProdutividade(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'produtividade', params],
    queryFn: () => getRdoAnalyticsProdutividade(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoMotivos(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'motivos', params],
    queryFn: () => getRdoAnalyticsMotivos(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoTimeline(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'timeline', params],
    queryFn: () => getRdoTimeline(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoTimelineMotivos(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'timeline', 'motivos', params],
    queryFn: () => getRdoTimelineMotivos(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoComparativo(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'comparativo', params],
    queryFn: () => getRdoComparativo(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoEficiencia(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'eficiencia', params],
    queryFn: () => getRdoEficiencia(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoFiltrosOpcoes(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'filtros-opcoes', params],
    queryFn: () => getRdoFiltrosOpcoes(params),
    ...CACHE_TIMES.filters,
  });
}

export function useRdoRanking(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'ranking', params],
    queryFn: () => getRdoRanking(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoOvertimeRanking(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'overtime-ranking', params],
    queryFn: () => getRdoOvertimeRanking(params),
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoAnomalias(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'anomalias', params],
    queryFn: () => getRdoAnomalias(params),
    ...CACHE_TIMES.analytics,
  });
}
