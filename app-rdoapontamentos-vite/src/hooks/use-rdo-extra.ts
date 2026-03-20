import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getColaboradorTimeline, getRdoDetalhesAll } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import type { RdoDetalhesParams } from '@/types/rdo-types';

export function useColaboradorTimeline(
  codparc: number | null,
  params: { dataInicio: string; dataFim: string },
) {
  return useQuery({
    queryKey: ['rdo', 'colaborador', codparc, 'timeline', params],
    queryFn: () => getColaboradorTimeline(codparc!, params),
    enabled: !!codparc && !!params.dataInicio && !!params.dataFim,
    ...CACHE_TIMES.analytics,
  });
}

export function useRdoDetalhesAll(params: RdoDetalhesParams) {
  return useQuery({
    queryKey: ['rdo', 'detalhes-all', params],
    queryFn: () => getRdoDetalhesAll(params),
    placeholderData: keepPreviousData,
    ...CACHE_TIMES.analytics,
  });
}
