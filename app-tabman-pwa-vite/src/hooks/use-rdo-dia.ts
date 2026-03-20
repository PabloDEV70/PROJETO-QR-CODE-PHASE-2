import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchRdoDia, fetchDetalhes, fetchMetricas } from '@/api/rdo';

export function useRdoDia(codparc: number, dtref?: string) {
  const data = dtref || format(new Date(), 'yyyy-MM-dd');
  const isToday = data === format(new Date(), 'yyyy-MM-dd');

  const rdoQuery = useQuery({
    queryKey: ['rdo-dia', codparc, data],
    queryFn: () => fetchRdoDia(codparc, data),
  });

  const codrdo = rdoQuery.data?.data?.[0]?.CODRDO ?? null;

  const detalhesQuery = useQuery({
    queryKey: ['rdo-detalhes', codrdo],
    queryFn: () => fetchDetalhes(codrdo!),
    enabled: !!codrdo,
    refetchInterval: isToday ? 60_000 : false,
  });

  const metricasQuery = useQuery({
    queryKey: ['rdo-metricas', codrdo],
    queryFn: () => fetchMetricas(codrdo!),
    enabled: !!codrdo,
  });

  const detalhes = detalhesQuery.data ?? [];
  const atividadeAtiva = isToday
    ? detalhes.find((d) => d.HRFIM === (d.HRINI ?? 0) + 1) ?? null
    : null; // Past days have no "active" activity

  return {
    codrdo,
    dtref: data,
    isToday,
    detalhes,
    metricas: metricasQuery.data ?? null,
    atividadeAtiva,
    isLoading: rdoQuery.isLoading,
  };
}
