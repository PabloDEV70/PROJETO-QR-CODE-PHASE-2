import { useQuery } from '@tanstack/react-query';
import { getOsEnriched, getOsObservacao } from '@/api/os-detail';

export function useOsDetail(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'detail', nuos],
    queryFn: () => getOsEnriched(nuos!),
    enabled: nuos !== null,
    staleTime: 60 * 1000,
  });
}

export function useOsObservacao(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'observacao', nuos],
    queryFn: () => getOsObservacao(nuos!),
    enabled: nuos !== null,
    staleTime: 120 * 1000,
  });
}
