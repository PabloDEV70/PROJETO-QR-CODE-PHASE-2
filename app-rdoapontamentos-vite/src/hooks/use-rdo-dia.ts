import { useQuery } from '@tanstack/react-query';
import { getRdoMetricas, getRdoDetalhes } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import type { RdoCabecalho } from '@/types/rdo-types';

export function useRdoDia(codrdo: number) {
  const metricasQuery = useQuery({
    queryKey: ['rdo-metricas', codrdo],
    queryFn: () => getRdoMetricas(codrdo),
    enabled: !!codrdo,
    ...CACHE_TIMES.rdoDetail,
  });

  const detalhesQuery = useQuery({
    queryKey: ['rdo-detalhes', codrdo],
    queryFn: () => getRdoDetalhes(codrdo),
    enabled: !!codrdo,
    ...CACHE_TIMES.rdoDetail,
  });

  // Backward compat: expose metricas also as cabecalho (superset)
  const cabecalho: RdoCabecalho | undefined = metricasQuery.data
    ? { ...metricasQuery.data, diagnosticoFaixa: metricasQuery.data.diagnosticoFaixa ?? null }
    : undefined;

  return {
    metricas: metricasQuery.data,
    cabecalho,
    detalhes: detalhesQuery.data ?? [],
    isLoading: metricasQuery.isLoading || detalhesQuery.isLoading,
    error: metricasQuery.error || detalhesQuery.error,
    refetch: () => { metricasQuery.refetch(); detalhesQuery.refetch(); },
  };
}
