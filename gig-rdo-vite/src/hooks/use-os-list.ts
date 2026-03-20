import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getOsList, getOsResumo, getOsColabServicos } from '@/api/os-list';
import type { OsListParams, OsColabParams } from '@/types/os-list-types';

export function useOsList(params: OsListParams) {
  return useQuery({
    queryKey: ['os', 'list', params],
    queryFn: () => getOsList(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useOsResumo(params: Omit<OsListParams, 'page' | 'limit'>) {
  return useQuery({
    queryKey: ['os', 'resumo', params],
    queryFn: () => getOsResumo(params),
    staleTime: 60 * 1000,
  });
}

export function useOsColabServicos(params: OsColabParams | null) {
  return useQuery({
    queryKey: ['os', 'colabServicos', params],
    queryFn: () => getOsColabServicos(params!),
    enabled: !!(params?.codusu || params?.codparc),
    staleTime: 30 * 1000,
  });
}
