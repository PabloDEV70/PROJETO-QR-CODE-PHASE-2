import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '@/api/hstvei';

export function useHstVeiStats() {
  return useQuery({
    queryKey: ['hstvei', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 25_000,
  });
}
