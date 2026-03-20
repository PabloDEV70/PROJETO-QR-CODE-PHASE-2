import { useQuery } from '@tanstack/react-query';
import { fetchPainel } from '@/api/hstvei';

export function useHstVeiPainel() {
  return useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    staleTime: 30_000,
  });
}
