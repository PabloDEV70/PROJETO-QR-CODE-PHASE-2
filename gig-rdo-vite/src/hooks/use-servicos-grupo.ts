import { useQuery } from '@tanstack/react-query';
import {
  getServicosArvore,
  getServicosPorGrupo,
} from '@/api/servicos-grupo';

export function useServicosArvore() {
  return useQuery({
    queryKey: ['servicos-arvore'],
    queryFn: getServicosArvore,
    staleTime: 1000 * 60 * 5,
  });
}

export function useServicosPorGrupo(codGrupo: number | null) {
  return useQuery({
    queryKey: ['servicos-por-grupo', codGrupo],
    queryFn: () => getServicosPorGrupo(codGrupo!),
    enabled: codGrupo !== null,
    staleTime: 1000 * 60 * 5,
  });
}
