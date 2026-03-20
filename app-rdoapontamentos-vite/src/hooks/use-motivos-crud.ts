import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMotivos,
  getMotivoById,
  searchMotivos,
  createMotivo,
  updateMotivo,
  deleteMotivo,
} from '@/api/rdo';
import { CACHE_TIMES } from '@/config/query-config';
import { useNotificationStore } from '@/stores/notification-store';
import { withOfflineQueue } from '@/utils/offline-mutation-wrapper';
import type { MotivosListParams, RdoMotivoFormData } from '@/types/rdo-types';

export function useMotivosGrid(params?: MotivosListParams) {
  return useQuery({
    queryKey: ['motivos-grid', params],
    queryFn: () => getMotivos(params),
    ...CACHE_TIMES.motivos,
  });
}

export function useMotivoById(id: number | null) {
  return useQuery({
    queryKey: ['motivo', id],
    queryFn: () => getMotivoById(id!),
    enabled: id != null,
    ...CACHE_TIMES.motivos,
  });
}

export function useSearchMotivos(q: string) {
  return useQuery({
    queryKey: ['motivos-search', q],
    queryFn: () => searchMotivos(q),
    enabled: q.length >= 2,
    ...CACHE_TIMES.motivos,
    refetchInterval: undefined, // on-demand search, no polling
  });
}

export function useCreateMotivo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: RdoMotivoFormData) =>
      withOfflineQueue('post', '/motivos', data, () => createMotivo(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motivos-grid'] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}

export function useUpdateMotivo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RdoMotivoFormData> }) =>
      withOfflineQueue('put', `/motivos/${id}`, data, () => updateMotivo(id, data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motivos-grid'] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}

export function useDeleteMotivo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: number) =>
      withOfflineQueue('delete', `/motivos/${id}`, undefined, () => deleteMotivo(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['motivos-grid'] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}
