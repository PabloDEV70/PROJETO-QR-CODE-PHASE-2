import { useQuery } from '@tanstack/react-query';
import {
  getDictionaryTables,
  searchDictionaryTables,
  searchDictionaryFields,
} from '@/api/dictionary-api';

const DICT_GC = 30 * 60_000;

export function useDictionaryTables() {
  return useQuery({
    queryKey: ['dict', 'tables'],
    queryFn: getDictionaryTables,
    staleTime: 10 * 60_000,
    gcTime: DICT_GC,
  });
}

export function useSearchDictionaryTables(term: string | null) {
  return useQuery({
    queryKey: ['dict', 'tables', 'search', term],
    queryFn: () => searchDictionaryTables(term!),
    enabled: !!term && term.length >= 2,
    staleTime: 60_000,
  });
}

export function useSearchDictionaryFields(term: string | null) {
  return useQuery({
    queryKey: ['dict', 'fields', 'search', term],
    queryFn: () => searchDictionaryFields(term!),
    enabled: !!term && term.length >= 2,
    staleTime: 60_000,
  });
}
