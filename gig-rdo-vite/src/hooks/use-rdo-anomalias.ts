import { useQuery } from '@tanstack/react-query';
import { getRdoAnomalias } from '@/api/rdo-analytics';

export function useRdoAnomalias(params: Record<string, string | number> = {}) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'anomalias', params],
    queryFn: () => getRdoAnomalias(params),
    staleTime: 60_000,
  });
}
