import { useQuery } from '@tanstack/react-query';
import {
  getServicosComExecucao,
  getGruposArvore,
  getPerformanceServicoExecutor,
  getPerformanceServicoExecucoes,
} from '@/api/eficiencia';
import type { EficienciaParams } from '@/types/eficiencia-types';

export function useServicosComExecucao() {
  return useQuery({
    queryKey: ['eficiencia', 'servicos-com-execucao'],
    queryFn: getServicosComExecucao,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGruposArvore() {
  return useQuery({
    queryKey: ['eficiencia', 'grupos-arvore'],
    queryFn: getGruposArvore,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformanceExecutor(params: EficienciaParams | null) {
  return useQuery({
    queryKey: ['eficiencia', 'perf-executor', params],
    queryFn: () => getPerformanceServicoExecutor(params!),
    enabled: !!params?.codprod,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePerformanceExecucoes(params: EficienciaParams | null) {
  return useQuery({
    queryKey: ['eficiencia', 'perf-execucoes', params],
    queryFn: () => getPerformanceServicoExecucoes(params!),
    enabled: !!params?.codprod,
    staleTime: 2 * 60 * 1000,
  });
}
