import { useQuery } from '@tanstack/react-query';
import { getPreventivQuadro } from '@/api/preventivas';

export function usePreventivQuadro() {
  return useQuery({
    queryKey: ['preventivas', 'quadro'],
    queryFn: getPreventivQuadro,
    staleTime: 5 * 60 * 1000,
  });
}
