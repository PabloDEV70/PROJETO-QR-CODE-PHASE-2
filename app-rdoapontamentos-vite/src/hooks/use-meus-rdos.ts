import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getMeusRdos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useEffectiveCodparc } from '@/hooks/use-effective-codparc';

interface UseMeusRdosParams {
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Simple query (used by HomePage for single-day fetch)
 */
export function useMeusRdos(params: UseMeusRdosParams = {}) {
  const codparc = useEffectiveCodparc();

  return useQuery({
    queryKey: ['meus-rdos', codparc, params.dataInicio, params.dataFim],
    queryFn: () =>
      getMeusRdos({
        codparc,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
      }),
    enabled: !!codparc,
    ...CACHE_TIMES.rdoList,
  });
}

const PAGE_SIZE = 20;

/**
 * Infinite scroll query for history page
 */
export function useMeusRdosInfinite(params: UseMeusRdosParams = {}) {
  const codparc = useEffectiveCodparc();

  return useInfiniteQuery({
    queryKey: ['meus-rdos-infinite', codparc, params.dataInicio, params.dataFim],
    queryFn: ({ pageParam = 1 }) =>
      getMeusRdos({
        codparc,
        page: pageParam,
        limit: PAGE_SIZE,
        dataInicio: params.dataInicio,
        dataFim: params.dataFim,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const total = lastPage.meta?.totalRegistros ?? lastPage.meta?.total ?? 0;
      const loaded = lastPageParam * PAGE_SIZE;
      return loaded < total ? lastPageParam + 1 : undefined;
    },
    enabled: !!codparc,
    ...CACHE_TIMES.rdoList,
    refetchInterval: undefined, // disable polling for infinite scroll (refetches all pages)
  });
}
