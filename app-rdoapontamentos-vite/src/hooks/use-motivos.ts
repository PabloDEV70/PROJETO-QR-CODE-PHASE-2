import { useQuery } from '@tanstack/react-query';
import { getMotivosAtivos } from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';

export function useMotivos() {
  return useQuery({
    queryKey: ['motivos'],
    queryFn: getMotivosAtivos,
    ...CACHE_TIMES.motivos,
  });
}
