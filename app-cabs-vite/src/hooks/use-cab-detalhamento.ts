import { useQuery } from '@tanstack/react-query';
import { getCabDetalhamento } from '@/api/cab-detalhamento';

export function useCabDetalhamento(nunota: number | null) {
  return useQuery({
    queryKey: ['cab-detalhamento', nunota],
    queryFn: () => getCabDetalhamento(nunota!),
    enabled: !!nunota && nunota > 0,
    staleTime: 30_000,
  });
}
