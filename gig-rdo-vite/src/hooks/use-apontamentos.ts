import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getApontamentosResumo,
  getApontamentosPendentes,
  getApontamentosComOs,
  getServicosFrequentes,
  getProdutosUtilizados,
  getApontamentosByVeiculo,
  getApontamentosByPeriodo,
  getApontamentosTimeline,
  getApontamentoByCode,
} from '@/api/apontamentos';
import type { PaginationParams, PeriodoParams } from '@/types/apontamentos-types';

export function useApontamentosResumo() {
  return useQuery({
    queryKey: ['apontamentos', 'resumo'],
    queryFn: getApontamentosResumo,
    staleTime: 60 * 1000,
  });
}

export function useApontamentosPendentes(params: PaginationParams) {
  return useQuery({
    queryKey: ['apontamentos', 'pendentes', params],
    queryFn: () => getApontamentosPendentes(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useApontamentosComOs(params: PaginationParams) {
  return useQuery({
    queryKey: ['apontamentos', 'com-os', params],
    queryFn: () => getApontamentosComOs(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useServicosFrequentes() {
  return useQuery({
    queryKey: ['apontamentos', 'servicos-frequentes'],
    queryFn: getServicosFrequentes,
    staleTime: 60 * 1000,
  });
}

export function useProdutosUtilizados() {
  return useQuery({
    queryKey: ['apontamentos', 'produtos-utilizados'],
    queryFn: getProdutosUtilizados,
    staleTime: 60 * 1000,
  });
}

export function useApontamentosByVeiculo(codveiculo?: number) {
  return useQuery({
    queryKey: ['apontamentos', 'by-veiculo', codveiculo],
    queryFn: () => getApontamentosByVeiculo(codveiculo),
    staleTime: 30 * 1000,
  });
}

export function useApontamentosByPeriodo(params: PeriodoParams | null) {
  return useQuery({
    queryKey: ['apontamentos', 'by-periodo', params],
    queryFn: () => getApontamentosByPeriodo(params!),
    enabled: !!params?.dtini && !!params?.dtfim,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useApontamentosTimeline(
  codveiculo: number | undefined,
  params: PaginationParams,
) {
  return useQuery({
    queryKey: ['apontamentos', 'timeline', codveiculo, params],
    queryFn: () => getApontamentosTimeline(codveiculo!, params),
    enabled: !!codveiculo,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useApontamentoByCode(codigo: number | undefined) {
  return useQuery({
    queryKey: ['apontamentos', 'detail', codigo],
    queryFn: () => getApontamentoByCode(codigo!),
    enabled: !!codigo,
    staleTime: 30 * 1000,
  });
}
