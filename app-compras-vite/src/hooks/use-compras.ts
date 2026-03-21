import { useQuery } from '@tanstack/react-query';
import { getRequisicoesPendentes, getCotacoesPendentes, getComprasResumo } from '@/api/compras';

export function useRequisicoesPendentes(tipo: 'compras' | 'manutencao' = 'compras') {
  return useQuery({
    queryKey: ['compras', 'requisicoes', tipo],
    queryFn: () => getRequisicoesPendentes(tipo),
    staleTime: 30_000,
  });
}

export function useCotacoesPendentes() {
  return useQuery({
    queryKey: ['compras', 'cotacoes'],
    queryFn: getCotacoesPendentes,
    staleTime: 30_000,
  });
}

export function useComprasResumo() {
  return useQuery({
    queryKey: ['compras', 'resumo'],
    queryFn: getComprasResumo,
    staleTime: 60_000,
  });
}
