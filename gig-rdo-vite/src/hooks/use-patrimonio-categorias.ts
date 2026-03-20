import { useQuery } from '@tanstack/react-query';

import { fetchPatrimonioCategorias } from '@/api/patrimonio';

export function usePatrimonioCategorias() {
  return useQuery({
    queryKey: ['patrimonio', 'categorias'],
    queryFn: fetchPatrimonioCategorias,
    staleTime: 60 * 1000,
  });
}
