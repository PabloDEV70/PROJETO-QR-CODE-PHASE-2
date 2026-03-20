import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getViews, getViewDetalhe, getProcedures, getProcedureDetalhe, getTriggers,
  getTriggerDetalhe, getRelacionamentos, getAuditHistorico, getAuditEstatisticas,
  getFunctions, getFunctionDetalhe,
} from '@/api/database';
import type { AuditoriaFilters } from '@/types/database-types';

const GC_LONG = 30 * 60_000;

export function useDbViews(enabled = true) {
  return useQuery({
    queryKey: ['db', 'views'],
    queryFn: getViews,
    enabled, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useViewDetalhe(schema: string | null, nome: string | null) {
  return useQuery({
    queryKey: ['db', 'views', schema, nome],
    queryFn: () => getViewDetalhe(schema!, nome!),
    enabled: !!schema && !!nome, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useDbProcedures(enabled = true) {
  return useQuery({
    queryKey: ['db', 'procedures'],
    queryFn: getProcedures,
    enabled, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useProcedureDetalhe(schema: string | null, nome: string | null) {
  return useQuery({
    queryKey: ['db', 'procedures', schema, nome],
    queryFn: () => getProcedureDetalhe(schema!, nome!),
    enabled: !!schema && !!nome, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useDbTriggers(enabled = true) {
  return useQuery({
    queryKey: ['db', 'triggers'],
    queryFn: getTriggers,
    enabled, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useTriggerDetalhe(schema: string | null, nome: string | null) {
  return useQuery({
    queryKey: ['db', 'triggers', schema, nome],
    queryFn: () => getTriggerDetalhe(schema!, nome!),
    enabled: !!schema && !!nome, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useDbFunctions(enabled = true) {
  return useQuery({
    queryKey: ['db', 'functions'],
    queryFn: getFunctions,
    enabled, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useFunctionDetalhe(schema: string | null, nome: string | null) {
  return useQuery({
    queryKey: ['db', 'functions', schema, nome],
    queryFn: () => getFunctionDetalhe(schema!, nome!),
    enabled: !!schema && !!nome, staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useDbRelacionamentos() {
  return useQuery({
    queryKey: ['db', 'relacionamentos'],
    queryFn: getRelacionamentos,
    staleTime: 10 * 60_000, gcTime: GC_LONG,
  });
}

export function useAuditHistorico(filters?: AuditoriaFilters) {
  return useQuery({
    queryKey: ['db', 'audit', 'historico', filters],
    queryFn: () => getAuditHistorico(filters),
    staleTime: 30_000, placeholderData: keepPreviousData,
  });
}

export function useAuditEstatisticas(
  params?: { tabela?: string; dataInicio?: string; dataFim?: string },
) {
  return useQuery({
    queryKey: ['db', 'audit', 'estatisticas', params],
    queryFn: () => getAuditEstatisticas(params),
    staleTime: 2 * 60_000, gcTime: GC_LONG,
  });
}
