import { useQuery } from '@tanstack/react-query';
import { fetchOsServicos } from '@/api/rdo';

export function useOsServicos(nuos: number | undefined) {
  return useQuery({
    queryKey: ['os-servicos', nuos],
    queryFn: async () => (await fetchOsServicos(nuos!)) ?? [],
    enabled: !!nuos,
    staleTime: 2 * 60_000,
  });
}
