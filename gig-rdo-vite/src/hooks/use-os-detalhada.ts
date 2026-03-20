import { useQuery } from '@tanstack/react-query';
import { fetchOsDetalhada } from '@/api/os-detalhada';

export function useOsDetalhada(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'detalhada', nuos],
    queryFn: () => fetchOsDetalhada(nuos!),
    enabled: nuos !== null,
    staleTime: 2 * 60 * 1000,
  });
}
