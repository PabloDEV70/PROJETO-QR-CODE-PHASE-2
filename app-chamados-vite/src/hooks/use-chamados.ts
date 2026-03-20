import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getChamadosList,
  getChamadosResumo,
  getChamadosKanban,
  getChamadosPorSetor,
  getChamadoById,
  getChamadoOcorrencias,
  getChamadoAnexos,
  getChamadosUsuarios,
} from '@/api/chamados';
import type { ChamadosListParams } from '@/types/chamados-types';

export function useChamadosList(params: ChamadosListParams) {
  return useQuery({
    queryKey: ['chamados', 'list', params],
    queryFn: () => getChamadosList(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useChamadosResumo() {
  return useQuery({
    queryKey: ['chamados', 'resumo'],
    queryFn: () => getChamadosResumo(),
    staleTime: 60_000,
  });
}

export function useChamadosKanban() {
  return useQuery({
    queryKey: ['chamados', 'kanban'],
    queryFn: () => getChamadosKanban(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useChamadosPorSetor() {
  return useQuery({
    queryKey: ['chamados', 'porSetor'],
    queryFn: () => getChamadosPorSetor(),
    staleTime: 60_000,
  });
}

export function useChamadoById(nuchamado: number | null) {
  return useQuery({
    queryKey: ['chamados', 'detail', nuchamado],
    queryFn: () => getChamadoById(nuchamado!),
    enabled: !!nuchamado,
    staleTime: 30_000,
  });
}

export function useChamadoOcorrencias(nuchamado: number | null) {
  return useQuery({
    queryKey: ['chamados', 'ocorrencias', nuchamado],
    queryFn: () => getChamadoOcorrencias(nuchamado!),
    enabled: !!nuchamado,
    staleTime: 30_000,
  });
}

export function useChamadoAnexos(nuchamado: number | null) {
  return useQuery({
    queryKey: ['chamados', 'anexos', nuchamado],
    queryFn: () => getChamadoAnexos(nuchamado!),
    enabled: !!nuchamado,
    staleTime: 60_000,
  });
}

export function useChamadosUsuarios() {
  return useQuery({
    queryKey: ['chamados', 'usuarios'],
    queryFn: () => getChamadosUsuarios(),
    staleTime: 5 * 60_000,
  });
}
