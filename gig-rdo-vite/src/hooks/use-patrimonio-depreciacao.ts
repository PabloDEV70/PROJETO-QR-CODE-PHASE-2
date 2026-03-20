import { useQuery } from '@tanstack/react-query';

import { fetchPatrimonioDepreciacao } from '@/api/patrimonio';

export function usePatrimonioDepreciacao() {
  return useQuery({
    queryKey: ['patrimonio', 'depreciacao'],
    queryFn: fetchPatrimonioDepreciacao,
    staleTime: 60 * 1000,
  });
}
