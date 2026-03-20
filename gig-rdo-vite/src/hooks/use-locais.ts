import { useQuery } from '@tanstack/react-query';
import {
  getLocaisArvore,
  getEstoquePorLocal,
  getProdutoDetalhes,
  getVeiculosPorProduto,
} from '@/api/locais';

export function useLocaisArvore() {
  return useQuery({
    queryKey: ['locais-arvore'],
    queryFn: getLocaisArvore,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEstoquePorLocal(codLocal: number | null) {
  return useQuery({
    queryKey: ['estoque-por-local', codLocal],
    queryFn: () => getEstoquePorLocal(codLocal!),
    enabled: codLocal !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProdutoDetalhes(codProd: number | null) {
  return useQuery({
    queryKey: ['produto-detalhes', codProd],
    queryFn: () => getProdutoDetalhes(codProd!),
    enabled: codProd !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProdutoVeiculos(codProd: number | null, usoProd?: string) {
  return useQuery({
    queryKey: ['produto-veiculos', codProd],
    queryFn: () => getVeiculosPorProduto(codProd!),
    enabled: codProd !== null && usoProd === 'I',
    staleTime: 1000 * 60 * 5,
  });
}
