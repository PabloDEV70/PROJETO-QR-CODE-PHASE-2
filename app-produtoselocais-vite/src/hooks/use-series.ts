import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getProdutosComSeries, getSeriesPorProduto,
  getHistoricoSerie, buscarSerie,
  getColaboradoresComMateriais, getMateriaisDoUsuario, getMateriaisDoParceiro,
} from '@/api/series';

export function useProdutosComSeries() {
  return useQuery({
    queryKey: ['series', 'produtos'],
    queryFn: getProdutosComSeries,
    staleTime: 5 * 60_000,
  });
}

export function useSeriesPorProduto(codProd: number | null) {
  return useQuery({
    queryKey: ['series', codProd],
    queryFn: () => getSeriesPorProduto(codProd!),
    enabled: !!codProd,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useHistoricoSerie(codProd: number | null, serie: string | null) {
  return useQuery({
    queryKey: ['series', 'historico', codProd, serie],
    queryFn: () => getHistoricoSerie(codProd!, serie!),
    enabled: !!codProd && !!serie,
    staleTime: 60_000,
  });
}

export function useBuscarSerie(q: string) {
  return useQuery({
    queryKey: ['series', 'buscar', q],
    queryFn: () => buscarSerie(q),
    enabled: q.length >= 3,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useColaboradoresComMateriais() {
  return useQuery({
    queryKey: ['empenhados', 'colaboradores'],
    queryFn: getColaboradoresComMateriais,
    staleTime: 5 * 60_000,
  });
}

export function useMateriaisDoUsuario(codusu: number | null) {
  return useQuery({
    queryKey: ['empenhados', 'usuario', codusu],
    queryFn: () => getMateriaisDoUsuario(codusu!),
    enabled: !!codusu,
    staleTime: 2 * 60_000,
    placeholderData: keepPreviousData,
  });
}

export function useMateriaisDoParceiro(codparc: number | null) {
  return useQuery({
    queryKey: ['empenhados', 'parceiro', codparc],
    queryFn: () => getMateriaisDoParceiro(codparc!),
    enabled: !!codparc,
    staleTime: 2 * 60_000,
    placeholderData: keepPreviousData,
  });
}
