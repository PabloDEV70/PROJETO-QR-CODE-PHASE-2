import { useQuery } from '@tanstack/react-query';

import { fetchPatrimonioBens } from '@/api/patrimonio';
import type { PatrimonioListFilters } from '@/types/patrimonio-types';

export function usePatrimonioBens(filters?: PatrimonioListFilters) {
  return useQuery({
    queryKey: ['patrimonio', 'bens', filters],
    queryFn: () => fetchPatrimonioBens(filters),
    staleTime: 60 * 1000,
  });
}
