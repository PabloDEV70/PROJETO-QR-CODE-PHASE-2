import { useQuery } from '@tanstack/react-query';
import { getOsServicos } from '@/api/funcionarios';

export function useOsServicos(nuos: number | undefined) {
  return useQuery({
    queryKey: ['os-servicos', nuos],
    queryFn: () => getOsServicos(nuos!),
    enabled: !!nuos,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
