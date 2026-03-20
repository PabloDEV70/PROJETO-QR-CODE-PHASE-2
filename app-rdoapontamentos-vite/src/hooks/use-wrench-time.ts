import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRdoMotivos, useRdoRanking } from './use-rdo-analytics';
import { getMotivosPorColaborador } from '../api/wrench-time';
import { CACHE_TIMES } from '@/config/query-config';
import { computeWrenchTimeMetrics, computeColabWrenchTime } from '../utils/wrench-time-categories';
import type { ColabRanking } from '../types/rdo-analytics-types';

export function useWrenchTimeMetrics(filterParams: Record<string, string | number>) {
  const motivosQuery = useRdoMotivos(filterParams);

  const metrics = useMemo(
    () => {
      if (!motivosQuery.data) return null;
      const { data: motivos, wtSummary } = motivosQuery.data;
      return computeWrenchTimeMetrics(motivos, wtSummary);
    },
    [motivosQuery.data],
  );

  return {
    data: motivosQuery.data?.data,
    isLoading: motivosQuery.isLoading,
    error: motivosQuery.error,
    metrics,
  };
}

export function useWrenchTimeByColab(filterParams: Record<string, string | number>) {
  const query = useQuery({
    queryKey: ['rdo', 'analytics', 'motivos', 'colaborador', filterParams],
    queryFn: () => getMotivosPorColaborador(filterParams),
    ...CACHE_TIMES.analytics,
  });

  const rankingQuery = useRdoRanking(filterParams);

  const rankingMap = useMemo(
    () => {
      if (!rankingQuery.data) return undefined;
      const map = new Map<number, ColabRanking>();
      for (const r of rankingQuery.data) map.set(r.codparc, r);
      return map;
    },
    [rankingQuery.data],
  );

  const colabs = useMemo(
    () => (query.data ? computeColabWrenchTime(query.data, rankingMap) : []),
    [query.data, rankingMap],
  );

  const isLoading = query.isLoading || rankingQuery.isLoading;

  return { ...query, isLoading, colabs };
}
