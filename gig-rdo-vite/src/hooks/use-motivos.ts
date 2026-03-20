import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMotivos, searchMotivos, getMotivo, getMotivosConfig } from '@/api/motivos';
import type { MotivosParams } from '@/types/motivos-types';

export function useMotivos(params: MotivosParams = {}) {
  return useQuery({
    queryKey: ['motivos', 'lista', params],
    queryFn: () => getMotivos(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useMotivosSearch(
  q: string,
  periodParams: { dataInicio?: string; dataFim?: string } = {},
) {
  return useQuery({
    queryKey: ['motivos', 'search', q, periodParams],
    queryFn: () => searchMotivos(q, periodParams),
    enabled: q.length >= 1,
    staleTime: 30 * 1000,
  });
}

export function useMotivo(id: number | null) {
  return useQuery({
    queryKey: ['motivos', 'detalhe', id],
    queryFn: () => getMotivo(id!),
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMotivosConfig() {
  return useQuery({
    queryKey: ['motivos', 'config'],
    queryFn: getMotivosConfig,
    staleTime: 10 * 60 * 1000,
  });
}
