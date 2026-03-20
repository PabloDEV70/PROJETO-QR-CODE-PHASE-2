import { useQuery } from '@tanstack/react-query';
import {
  getQueriesAtivas,
  getQueriesPesadas,
  getEstatisticasQuery,
  getSessoes,
  getVisaoServidor,
  getEstatisticasEspera,
} from '@/api/database';

const GC_LONG = 30 * 60_000;

export function useQueriesAtivas() {
  return useQuery({
    queryKey: ['db', 'monitor', 'queries-ativas'],
    queryFn: getQueriesAtivas,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useQueriesPesadas(params?: { limite?: number; cpuMinimo?: number }) {
  return useQuery({
    queryKey: ['db', 'monitor', 'queries-pesadas', params],
    queryFn: () => getQueriesPesadas(params),
    staleTime: 60_000,
    gcTime: GC_LONG,
  });
}

export function useEstatisticasQuery(params?: { limite?: number }) {
  return useQuery({
    queryKey: ['db', 'monitor', 'estatisticas-query', params],
    queryFn: () => getEstatisticasQuery(params),
    staleTime: 60_000,
    gcTime: GC_LONG,
  });
}

export function useSessoes() {
  return useQuery({
    queryKey: ['db', 'monitor', 'sessoes'],
    queryFn: getSessoes,
    refetchInterval: 45_000,
    staleTime: 20_000,
  });
}

export function useVisaoServidor() {
  return useQuery({
    queryKey: ['db', 'monitor', 'visao-servidor'],
    queryFn: getVisaoServidor,
    staleTime: 2 * 60_000,
    gcTime: GC_LONG,
  });
}

export function useEstatisticasEspera(params?: { limite?: number }) {
  return useQuery({
    queryKey: ['db', 'monitor', 'estatisticas-espera', params],
    queryFn: () => getEstatisticasEspera(params),
    staleTime: 60_000,
    gcTime: GC_LONG,
  });
}
