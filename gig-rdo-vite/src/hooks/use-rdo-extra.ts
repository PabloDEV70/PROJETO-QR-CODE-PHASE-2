import { useQuery } from '@tanstack/react-query';
import { getRdoMetricas, getColaboradorTimeline } from '@/api/rdo-core';
import { getRdoHoraExtra, getRdoAssiduidade } from '@/api/rdo-analytics';

export function useRdoMetricas(codrdo: number | null) {
  return useQuery({
    queryKey: ['rdo', 'metricas', codrdo],
    queryFn: () => getRdoMetricas(codrdo!),
    enabled: !!codrdo,
    staleTime: 30 * 1000,
  });
}

export function useRdoHoraExtra(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'hora-extra', params],
    queryFn: () => getRdoHoraExtra(params),
    staleTime: 60_000,
  });
}

export function useRdoAssiduidade(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'assiduidade', params],
    queryFn: () => getRdoAssiduidade(params),
    staleTime: 60_000,
  });
}

export function useColaboradorTimeline(
  codparc: number | null,
  params: { dataInicio: string; dataFim: string },
) {
  return useQuery({
    queryKey: ['rdo', 'colaborador', codparc, 'timeline', params],
    queryFn: () => getColaboradorTimeline(codparc!, params),
    enabled: !!codparc && !!params.dataInicio && !!params.dataFim,
    staleTime: 60 * 1000,
  });
}
