import { useQuery } from '@tanstack/react-query';
import { getCabDetalhamento } from '@/api/cab-detalhamento';
import { CACHE_TIMES } from '@/config/query-config';

export function useCabDetalhamento(nunota: number | null) {
  return useQuery({
    queryKey: ['cab-detalhamento', nunota],
    queryFn: () => getCabDetalhamento(nunota!),
    enabled: !!nunota && nunota > 0,
    ...CACHE_TIMES.rdoDetail,
  });
}
