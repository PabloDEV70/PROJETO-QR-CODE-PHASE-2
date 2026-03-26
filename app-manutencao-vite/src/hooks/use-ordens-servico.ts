import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getOsList, getOsResumo, getOsById, getOsAtivas,
  getOsCompras, getOsTimeline,
} from '@/api/ordens-servico';
import type { OsListParams } from '@/types/os-types';

export function useOsList(params: OsListParams) {
  return useQuery({
    queryKey: ['os', 'list', params],
    queryFn: () => getOsList(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useOsResumo(params: OsListParams = {}) {
  return useQuery({
    queryKey: ['os', 'resumo', params],
    queryFn: () => getOsResumo(params),
    staleTime: 60_000,
  });
}

export function useOsById(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'detail', nuos],
    queryFn: () => getOsById(nuos!),
    enabled: !!nuos,
    staleTime: 30_000,
  });
}


export function useOsAtivas() {
  return useQuery({
    queryKey: ['os', 'ativas'],
    queryFn: () => getOsAtivas(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useOsCompras(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'compras', nuos],
    queryFn: () => getOsCompras(nuos!),
    enabled: !!nuos,
    staleTime: 30_000,
  });
}

export function useOsTimeline(nuos: number | null) {
  return useQuery({
    queryKey: ['os', 'timeline', nuos],
    queryFn: () => getOsTimeline(nuos!),
    enabled: !!nuos,
    staleTime: 30_000,
  });
}
