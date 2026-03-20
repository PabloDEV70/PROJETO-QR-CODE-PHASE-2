import { useQuery } from '@tanstack/react-query';
import { buscarUsuarios } from '@/api/usuarios';

export function useBuscarUsuarios(termo: string, ativo: 'S' | 'N' = 'S') {
  return useQuery({
    queryKey: ['usuarios', 'search', termo, ativo],
    queryFn: () => buscarUsuarios(termo, ativo),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
