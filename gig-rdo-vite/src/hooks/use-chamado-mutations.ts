import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateChamado,
  updateChamadoStatus,
  createChamado,
  addOcorrencia,
} from '@/api/chamados';
import type {
  UpdateChamadoPayload,
  ChamadoStatusCode,
  KanbanColumn,
  CreateChamadoPayload,
  AddOcorrenciaPayload,
} from '@/types/chamados-types';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';

function invalidateChamados(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['chamados', 'kanban'] });
  qc.invalidateQueries({ queryKey: ['chamados', 'resumo'] });
  qc.invalidateQueries({ queryKey: ['chamados', 'list'] });
}

export function useUpdateChamado() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ nuchamado, payload }: { nuchamado: number; payload: UpdateChamadoPayload }) =>
      updateChamado(nuchamado, payload),
    onMutate: async ({ nuchamado, payload }) => {
      if (!payload.STATUS) return {};
      await qc.cancelQueries({ queryKey: ['chamados', 'kanban'] });
      const prev = qc.getQueriesData<KanbanColumn[]>({ queryKey: ['chamados', 'kanban'] });

      qc.setQueriesData<KanbanColumn[]>(
        { queryKey: ['chamados', 'kanban'] },
        (old) => {
          if (!old) return old;
          const card = old.flatMap((c) => c.chamados).find((c) => c.NUCHAMADO === nuchamado);
          if (!card) return old;
          const updated = { ...card, ...payload };
          return old.map((col) => ({
            ...col,
            chamados: col.status === payload.STATUS
              ? col.chamados.some((c) => c.NUCHAMADO === nuchamado)
                ? col.chamados.map((c) => c.NUCHAMADO === nuchamado ? updated : c)
                : [...col.chamados, updated]
              : col.chamados.filter((c) => c.NUCHAMADO !== nuchamado),
          }));
        },
      );

      return { prev };
    },
    onSuccess: (_data, { nuchamado }) => {
      invalidateChamados(qc);
      qc.invalidateQueries({ queryKey: ['chamados', 'detail', nuchamado] });
      addToast('success', 'Chamado atualizado com sucesso');
    },
    onError: (err: Error, _vars, context) => {
      if (context?.prev) {
        for (const [key, data] of context.prev) {
          qc.setQueryData(key, data);
        }
      }
      addToast('error', `Erro ao atualizar chamado: ${err.message}`);
    },
  });
}

export function useCreateChamado() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateChamadoPayload) => createChamado(payload),
    onSuccess: () => {
      invalidateChamados(qc);
      addToast('success', 'Chamado criado com sucesso');
    },
    onError: (err: Error) => {
      addToast('error', `Erro ao criar chamado: ${err.message}`);
    },
  });
}

export function useAddOcorrencia() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ nuchamado, payload }: {
      nuchamado: number;
      payload: AddOcorrenciaPayload;
    }) => addOcorrencia(nuchamado, payload),
    onSuccess: (_data, { nuchamado }) => {
      qc.invalidateQueries({ queryKey: ['chamados', 'ocorrencias', nuchamado] });
      addToast('success', 'Tratativa adicionada com sucesso');
    },
    onError: (err: Error) => {
      addToast('error', `Erro ao adicionar tratativa: ${err.message}`);
    },
  });
}

export function useUpdateChamadoStatus() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);
  const codUsu = useAuthStore((s) => s.user?.codusu);

  return useMutation({
    mutationFn: ({ nuchamado, status }: { nuchamado: number; status: ChamadoStatusCode }) =>
      updateChamadoStatus(nuchamado, { status, codUsu }),
    onMutate: async ({ nuchamado, status }) => {
      await qc.cancelQueries({ queryKey: ['chamados', 'kanban'] });
      const prev = qc.getQueriesData<KanbanColumn[]>({ queryKey: ['chamados', 'kanban'] });

      qc.setQueriesData<KanbanColumn[]>(
        { queryKey: ['chamados', 'kanban'] },
        (old) => {
          if (!old) return old;
          const card = old.flatMap((c) => c.chamados).find((c) => c.NUCHAMADO === nuchamado);
          if (!card) return old;
          return old.map((col) => ({
            ...col,
            chamados: col.status === status
              ? [...col.chamados, { ...card, STATUS: status }]
              : col.chamados.filter((c) => c.NUCHAMADO !== nuchamado),
          }));
        },
      );

      return { prev };
    },
    onError: (err: Error, _vars, context) => {
      if (context?.prev) {
        for (const [key, data] of context.prev) {
          qc.setQueryData(key, data);
        }
      }
      addToast('error', `Erro ao alterar status: ${err.message}`);
    },
    onSettled: () => {
      invalidateChamados(qc);
    },
  });
}
