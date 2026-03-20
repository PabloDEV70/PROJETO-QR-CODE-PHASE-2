import { useQuery } from '@tanstack/react-query';
import {
  buscarProdutos, getProdutoFull, getEstoqueProduto,
  getPlacasProduto, getGruposProduto,
} from '@/api/produtos';

/** Lightweight search — fast, no estoque */
export function useProdutos(q: string, grupo: string, limit = 30) {
  return useQuery({
    queryKey: ['produtos', q, grupo, limit],
    queryFn: () => buscarProdutos({ q: q || undefined, grupo: grupo || undefined, limit }),
    enabled: q.length >= 2 || !!grupo,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

/** Full product by ID — loaded on expand */
export function useProdutoFull(codProd: number | null) {
  return useQuery({
    queryKey: ['produto-full', codProd],
    queryFn: () => getProdutoFull(codProd!),
    enabled: !!codProd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

/** Stock by location — loaded on expand */
export function useEstoqueProduto(codProd: number | null) {
  return useQuery({
    queryKey: ['produto-estoque', codProd],
    queryFn: () => getEstoqueProduto(codProd!),
    enabled: !!codProd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

/** Vehicles that used this product — loaded on expand */
export function usePlacasProduto(codProd: number | null) {
  return useQuery({
    queryKey: ['produto-placas', codProd],
    queryFn: () => getPlacasProduto(codProd!),
    enabled: !!codProd,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useGruposProduto() {
  return useQuery({
    queryKey: ['produtos-grupos'],
    queryFn: getGruposProduto,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
