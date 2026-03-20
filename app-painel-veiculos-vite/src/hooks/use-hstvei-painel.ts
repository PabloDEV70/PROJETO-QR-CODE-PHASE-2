import { useQuery } from '@tanstack/react-query';
import { fetchPainel } from '@/api/hstvei';

export function useHstVeiPainel() {
  return useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    staleTime: 25_000,
  });
}
