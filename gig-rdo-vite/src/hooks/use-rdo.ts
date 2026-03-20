import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getRdoList,
  getRdoById,
  getRdoDetalhesById,
  getRdoDetalhes,
} from '@/api/rdo-core';
import { getRdoAnalyticsResumo } from '@/api/rdo-analytics';
import { getMotivos } from '@/api/motivos';
import type { RdoDetalhesParams, RdoListParams } from '@/types/rdo-types';

export function useRdoList(params: RdoListParams) {
  return useQuery({
    queryKey: ['rdo', 'list', params],
    queryFn: () => getRdoList(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRdoById(codrdo: number | null) {
  return useQuery({
    queryKey: ['rdo', 'byId', codrdo],
    queryFn: () => getRdoById(codrdo!),
    enabled: !!codrdo,
    staleTime: 30 * 1000,
  });
}

export function useRdoDetalhesById(codrdo: number | null) {
  return useQuery({
    queryKey: ['rdo', 'detalhesById', codrdo],
    queryFn: () => getRdoDetalhesById(codrdo!),
    enabled: !!codrdo,
    staleTime: 30 * 1000,
  });
}

export function useRdoDetalhes(params: RdoDetalhesParams) {
  return useQuery({
    queryKey: ['rdo', 'detalhes', params],
    queryFn: () => getRdoDetalhes(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useRdoResumo(params: Omit<RdoDetalhesParams, 'page' | 'limit'>) {
  return useQuery({
    queryKey: ['rdo', 'analytics', 'resumo', params],
    queryFn: () => getRdoAnalyticsResumo(params),
    staleTime: 60 * 1000,
  });
}

export function useMotivosOptions() {
  return useQuery({
    queryKey: ['motivos', 'all'],
    queryFn: () => getMotivos({ ativo: 'S' }),
    staleTime: 10 * 60 * 1000,
  });
}
