import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getDictionaryTableFields,
  getFieldOptions,
  getTableInstances,
  getFieldTypesMeta,
  getPresentationTypesMeta,
  getTableTriggers,
} from '@/api/dictionary-api';

const DICT_GC = 30 * 60_000;

export function useDictionaryTableFields(tableName: string | null) {
  return useQuery({
    queryKey: ['dict', 'fields', tableName],
    queryFn: () => getDictionaryTableFields(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60_000,
    gcTime: DICT_GC,
  });
}

export function useFieldOptions(nucampo: number | null) {
  return useQuery({
    queryKey: ['dict', 'options', nucampo],
    queryFn: () => getFieldOptions(nucampo!),
    enabled: !!nucampo,
    staleTime: 10 * 60_000,
    gcTime: DICT_GC,
  });
}

export function useTableInstances(tableName: string | null) {
  return useQuery({
    queryKey: ['dict', 'instances', tableName],
    queryFn: () => getTableInstances(tableName!),
    enabled: !!tableName,
    staleTime: 10 * 60_000,
    gcTime: DICT_GC,
  });
}

export function useTableTriggers(tableName: string | null) {
  return useQuery({
    queryKey: ['dict', 'triggers', tableName],
    queryFn: () => getTableTriggers(tableName!),
    enabled: !!tableName,
    staleTime: 5 * 60_000,
    gcTime: DICT_GC,
  });
}

export function useFieldTypesMeta() {
  return useQuery({
    queryKey: ['dict', 'meta', 'field-types'],
    queryFn: getFieldTypesMeta,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

export function usePresentationTypesMeta() {
  return useQuery({
    queryKey: ['dict', 'meta', 'presentation-types'],
    queryFn: getPresentationTypesMeta,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}

/** Prefetch fields + triggers for a table (call on hover). */
export function usePrefetchTable() {
  const qc = useQueryClient();
  return useCallback((tableName: string) => {
    qc.prefetchQuery({
      queryKey: ['dict', 'fields', tableName],
      queryFn: () => getDictionaryTableFields(tableName),
      staleTime: 10 * 60_000,
    });
    qc.prefetchQuery({
      queryKey: ['dict', 'triggers', tableName],
      queryFn: () => getTableTriggers(tableName),
      staleTime: 5 * 60_000,
    });
  }, [qc]);
}
