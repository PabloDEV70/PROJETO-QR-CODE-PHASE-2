import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHstVeiList, fetchSituacoes,
  createHstVei, updateHstVei, encerrarHstVei,
} from '@/api/hstvei-crud';
import type { HstVeiListParams, HstVeiCreatePayload, HstVeiUpdatePayload } from '@/api/hstvei-crud';

export function useHstVeiList(params: HstVeiListParams) {
  return useQuery({
    queryKey: ['hstvei', 'list', params],
    queryFn: () => fetchHstVeiList(params),
    staleTime: 10_000,
  });
}

export function useSituacoes() {
  return useQuery({
    queryKey: ['hstvei', 'situacoes'],
    queryFn: fetchSituacoes,
    staleTime: 5 * 60_000,
  });
}

export function useCreateHstVei() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HstVeiCreatePayload) => createHstVei(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
  });
}

export function useUpdateHstVei() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HstVeiUpdatePayload }) =>
      updateHstVei(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
  });
}

export function useEncerrarHstVei() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => encerrarHstVei(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
  });
}
