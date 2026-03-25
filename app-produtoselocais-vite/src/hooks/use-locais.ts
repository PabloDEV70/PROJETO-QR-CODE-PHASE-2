import { useQuery } from '@tanstack/react-query';
import {
  fetchArvoreLocais, fetchEstoquePorLocal,
  fetchProdutosBusca, fetchProdutoDetalhes, fetchProdutoFull,
  fetchProdutoEstoque, fetchProdutoVeiculos, fetchGruposProduto,
  type BuscarProdutosParams,
} from '@/api/locais';

export function useArvoreLocais() {
  return useQuery({
    queryKey: ['locais', 'arvore'],
    queryFn: fetchArvoreLocais,
    staleTime: 5 * 60_000,
  });
}

export function useEstoquePorLocal(codLocal: number | null) {
  return useQuery({
    queryKey: ['locais', 'estoque', codLocal],
    queryFn: () => fetchEstoquePorLocal(codLocal!),
    enabled: codLocal !== null && codLocal > 0,
    staleTime: 30_000,
  });
}

export function useProdutosBusca(params: BuscarProdutosParams) {
  return useQuery({
    queryKey: ['produtos', 'busca', params],
    queryFn: () => fetchProdutosBusca(params),
    enabled: !params.q || params.q.length >= 2,
    staleTime: 30_000,
  });
}

export function useProdutoDetalhes(codProd: number | null) {
  return useQuery({
    queryKey: ['produtos', 'detalhes', codProd],
    queryFn: () => fetchProdutoDetalhes(codProd!),
    enabled: codProd !== null && codProd > 0,
    staleTime: 60_000,
  });
}

export function useProdutoFull(codProd: number | null) {
  return useQuery({
    queryKey: ['produtos', 'full', codProd],
    queryFn: () => fetchProdutoFull(codProd!),
    enabled: codProd !== null && codProd > 0,
    staleTime: 60_000,
  });
}

export function useProdutoEstoque(codProd: number | null) {
  return useQuery({
    queryKey: ['produtos', 'estoque', codProd],
    queryFn: () => fetchProdutoEstoque(codProd!),
    enabled: codProd !== null && codProd > 0,
    staleTime: 30_000,
  });
}

export function useProdutoVeiculos(codProd: number | null) {
  return useQuery({
    queryKey: ['produtos', 'veiculos', codProd],
    queryFn: () => fetchProdutoVeiculos(codProd!),
    enabled: codProd !== null && codProd > 0,
    staleTime: 60_000,
  });
}

export function useGruposProduto() {
  return useQuery({
    queryKey: ['produtos', 'grupos'],
    queryFn: fetchGruposProduto,
    staleTime: 5 * 60_000,
  });
}
