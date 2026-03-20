import { useQuery } from '@tanstack/react-query';
import {
  getAllRdos,
  getRdoStats,
  getRdoResumoDiario,
  searchRdos,
} from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import type { RdoListParams } from '@/types/rdo-types';

export function useAllRdos(params: RdoListParams = {}) {
  return useQuery({
    queryKey: ['admin-rdos', params],
    queryFn: () => getAllRdos(params),
    ...CACHE_TIMES.rdoList,
  });
}

export function useRdoStats(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: ['rdo-stats', params],
    queryFn: () => getRdoStats(params),
    ...CACHE_TIMES.stats,
  });
}

export function useRdoResumoDiario(
  params: {
    page?: number;
    limit?: number;
    dataInicio?: string;
    dataFim?: string;
  } = {},
) {
  return useQuery({
    queryKey: ['rdo-resumo-diario', params],
    queryFn: () => getRdoResumoDiario(params),
    ...CACHE_TIMES.stats,
  });
}

export function useSearchRdos(q: string) {
  return useQuery({
    queryKey: ['rdo-search', q],
    queryFn: () => searchRdos(q),
    enabled: q.length >= 2,
    ...CACHE_TIMES.rdoList,
    refetchInterval: undefined, // on-demand search, no polling
  });
}
