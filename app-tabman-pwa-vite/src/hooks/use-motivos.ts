import { useQuery } from '@tanstack/react-query';
import { fetchMotivos } from '@/api/rdo';

export function useMotivos() {
  return useQuery({
    queryKey: ['motivos'],
    queryFn: fetchMotivos,
    staleTime: 10 * 60_000,
  });
}
