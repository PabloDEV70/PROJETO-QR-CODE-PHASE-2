import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRdoMotivos, useRdoRanking } from '@/hooks/use-rdo-analytics';
import { getMotivosPorColaborador } from '@/api/wrench-time';
import { computeWrenchTimeMetrics, computeColabWrenchTime } from '@/utils/wrench-time-categories';
import type { ColabRanking } from '@/types/rdo-analytics-types';
import type { RdoDetalhesParams } from '@/types/rdo-types';

type FilterParams = Omit<RdoDetalhesParams, 'page' | 'limit'>;

export function useWrenchTimeMetrics(filterParams: FilterParams) {
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

export function useWrenchTimeByColab(filterParams: FilterParams) {
  const query = useQuery({
    queryKey: ['rdo', 'analytics', 'motivos', 'colaborador', filterParams],
    queryFn: () => getMotivosPorColaborador(filterParams),
    staleTime: 60_000,
  });

  const rankingQuery = useRdoRanking(filterParams as Record<string, string | number>);

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
