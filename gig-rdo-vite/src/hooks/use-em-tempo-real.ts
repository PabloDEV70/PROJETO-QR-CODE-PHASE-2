import { useQuery } from '@tanstack/react-query';
import {
  getEmTempoRealMovimentacoes,
  getEmTempoRealResumo,
  getNotaDetalhe,
} from '@/api/em-tempo-real';

const REFETCH_INTERVAL = 15_000;

export function useEmTempoRealMovimentacoes() {
  return useQuery({
    queryKey: ['em-tempo-real', 'movimentacoes'],
    queryFn: getEmTempoRealMovimentacoes,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 10_000,
  });
}

export function useEmTempoRealResumo() {
  return useQuery({
    queryKey: ['em-tempo-real', 'resumo'],
    queryFn: getEmTempoRealResumo,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 10_000,
  });
}

export function useNotaDetalhe(nunota: number | null) {
  return useQuery({
    queryKey: ['em-tempo-real', 'detalhe', nunota],
    queryFn: () => getNotaDetalhe(nunota!),
    enabled: nunota !== null,
    staleTime: 30_000,
  });
}
