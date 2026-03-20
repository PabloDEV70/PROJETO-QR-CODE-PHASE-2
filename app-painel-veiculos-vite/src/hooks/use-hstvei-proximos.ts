import { useQuery } from '@tanstack/react-query';
import { fetchProximos } from '@/api/hstvei';

export function useHstVeiProximos() {
  return useQuery({
    queryKey: ['hstvei', 'proximos'],
    queryFn: fetchProximos,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 25_000,
  });
}
