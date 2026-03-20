import { useQuery } from '@tanstack/react-query';
import { fetchOsDashboard } from '@/api/os-dashboard';

export function useOsDashboard() {
  return useQuery({
    queryKey: ['os', 'dashboard'],
    queryFn: fetchOsDashboard,
    staleTime: 1000 * 60 * 5,
  });
}
