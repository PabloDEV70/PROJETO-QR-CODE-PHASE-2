import { useQuery } from '@tanstack/react-query';

import { fetchPatrimonioDashboard } from '@/api/patrimonio';

export function usePatrimonioDashboard() {
  return useQuery({
    queryKey: ['patrimonio', 'dashboard'],
    queryFn: fetchPatrimonioDashboard,
    staleTime: 60 * 1000,
  });
}
