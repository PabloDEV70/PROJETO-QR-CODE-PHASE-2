import { useQuery } from '@tanstack/react-query';
import { fetchCadeiaNotas, fetchItensNota } from '@/api/hstvei';

export function useCadeiaNotas(id: number) {
  return useQuery({
    queryKey: ['hstvei', 'cadeia-notas', id],
    queryFn: () => fetchCadeiaNotas(id),
    enabled: id > 0,
  });
}

export function useItensNota(id: number) {
  return useQuery({
    queryKey: ['hstvei', 'itens-nota', id],
    queryFn: () => fetchItensNota(id),
    enabled: id > 0,
  });
}
