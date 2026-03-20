import { useQuery } from '@tanstack/react-query';
import { fetchSituacoes, fetchPrioridades } from '@/api/hstvei';

export function useSituacoes() {
  return useQuery({
    queryKey: ['hstvei', 'situacoes'],
    queryFn: fetchSituacoes,
    staleTime: 30 * 60 * 1000,
  });
}

export function usePrioridades() {
  return useQuery({
    queryKey: ['hstvei', 'prioridades'],
    queryFn: fetchPrioridades,
    staleTime: 30 * 60 * 1000,
  });
}
