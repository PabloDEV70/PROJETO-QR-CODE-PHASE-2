import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCorridasList,
  getCorridaById,
  getCorridasResumo,
  getMotoristas,
  createCorrida,
  updateCorrida,
  updateCorridaStatus,
  assignMotorista,
} from '@/api/corridas';
import type { ListCorridasParams, CreateCorridaPayload, UpdateCorridaPayload } from '@/types/corrida';
import { useNotificationStore } from '@/stores/notification-store';

export function useCorridasList(params: ListCorridasParams) {
  return useQuery({
    queryKey: ['corridas', 'list', params],
    queryFn: () => getCorridasList(params),
  });
}

export function useCorridaById(id: number | null) {
  return useQuery({
    queryKey: ['corridas', 'detail', id],
    queryFn: () => getCorridaById(id!),
    enabled: id !== null && id > 0,
  });
}

export function useCorridasResumo() {
  return useQuery({
    queryKey: ['corridas', 'resumo'],
    queryFn: getCorridasResumo,
    staleTime: 30_000,
  });
}

export function useMotoristas() {
  return useQuery({
    queryKey: ['corridas', 'motoristas'],
    queryFn: getMotoristas,
    staleTime: 5 * 60_000,
  });
}

export function useCreateCorrida() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateCorridaPayload) => createCorrida(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corridas'] });
      addToast('success', 'Corrida solicitada com sucesso');
    },
  });
}

export function useUpdateCorrida() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCorridaPayload }) =>
      updateCorrida(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corridas'] });
      addToast('success', 'Corrida atualizada');
    },
  });
}

export function useUpdateCorridaStatus() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status, codUsu }: { id: number; status: string; codUsu?: number }) =>
      updateCorridaStatus(id, status, codUsu),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corridas'] });
      addToast('success', 'Status atualizado');
    },
  });
}

export function useAssignMotorista() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, codUsu }: { id: number; codUsu: number }) =>
      assignMotorista(id, codUsu),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corridas'] });
      addToast('success', 'Motorista atribuido');
    },
  });
}
