import { useQuery } from '@tanstack/react-query';
import { getEmpresas } from '@/api/lookups';

export function useEmpresas() {
  return useQuery({
    queryKey: ['lookups', 'empresas'],
    queryFn: getEmpresas,
    staleTime: 5 * 60_000,
  });
}
