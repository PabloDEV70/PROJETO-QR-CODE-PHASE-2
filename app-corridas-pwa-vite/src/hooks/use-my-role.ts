import { useQuery } from '@tanstack/react-query';
import { getMyRole } from '@/api/corridas';

export function useMyRole() {
  return useQuery({
    queryKey: ['corridas', 'me', 'role'],
    queryFn: getMyRole,
    staleTime: 10 * 60_000,
  });
}
