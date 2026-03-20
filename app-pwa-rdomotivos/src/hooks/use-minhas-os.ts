import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { OsListItem, OsListResponse } from '@/types/os-types';

async function fetchOsList(status: string): Promise<OsListItem[]> {
  const { data } = await apiClient.get<OsListResponse>('/os/list', {
    params: { status, limit: 100 },
  });
  return data.data ?? [];
}

/**
 * Busca TODAS as OS abertas (A) + em execução (E).
 * Sem filtro de executor — mostra todas disponíveis.
 * codparc serve apenas como enabled gate (user logado).
 */
export function useMinhasOs(codparc: number | undefined) {
  return useQuery({
    queryKey: ['minhas-os', codparc],
    queryFn: async (): Promise<OsListItem[]> => {
      const [abertas, emExec] = await Promise.all([
        fetchOsList('A'),
        fetchOsList('E'),
      ]);
      const map = new Map<number, OsListItem>();
      for (const os of [...abertas, ...emExec]) {
        map.set(os.NUOS, os);
      }
      return [...map.values()].sort((a, b) => b.NUOS - a.NUOS);
    },
    enabled: !!codparc,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
