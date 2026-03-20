import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '@/api/hstvei';

export function useHstVeiStats() {
  return useQuery({
    queryKey: ['hstvei', 'stats'],
    queryFn: fetchStats,
    staleTime: 30_000,
  });
}
