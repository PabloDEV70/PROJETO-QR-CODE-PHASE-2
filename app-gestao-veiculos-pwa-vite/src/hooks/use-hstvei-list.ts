import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchHstVeiList, fetchOperadores } from '@/api/hstvei';
import type { ListHstVeiParams } from '@/api/hstvei';

export function useHstVeiList(params: ListHstVeiParams) {
  return useQuery({
    queryKey: ['hstvei', 'list', params],
    queryFn: () => fetchHstVeiList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useOperadores() {
  return useQuery({
    queryKey: ['hstvei', 'operadores'],
    queryFn: fetchOperadores,
    staleTime: 30_000,
  });
}
