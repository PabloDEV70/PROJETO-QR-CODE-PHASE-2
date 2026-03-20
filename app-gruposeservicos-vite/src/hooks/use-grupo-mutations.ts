import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  createGrupo,
  updateGrupo,
  toggleGrupoAtivo,
  createServico,
  updateServico,
  moveServico,
  toggleServicoAtivo,
} from '@/api/grupos-mutation';
import type {
  CreateGrupoInput,
  UpdateGrupoInput,
  CreateServicoInput,
  UpdateServicoInput,
  MoveServicoInput,
  ToggleAtivoInput,
} from '@/types/grupo-types';
import { parseApiError } from '@/types/api-error';

function useInvalidateGrupos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['servicos-grupo'] });
  };
}

export function useIsProd() {
  const database = useAuthStore((s) => s.database);
  return database === 'PROD';
}

export function useCreateGrupo() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: (input: CreateGrupoInput) => createGrupo(input),
    onSuccess: () => {
      addToast('success', 'Grupo criado com sucesso');
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useUpdateGrupo() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: ({ codGrupo, input }: { codGrupo: number; input: UpdateGrupoInput }) =>
      updateGrupo(codGrupo, input),
    onSuccess: () => {
      addToast('success', 'Grupo atualizado com sucesso');
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useToggleGrupoAtivo() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: ({ codGrupo, input }: { codGrupo: number; input: ToggleAtivoInput }) =>
      toggleGrupoAtivo(codGrupo, input),
    onSuccess: (_, variables) => {
      const label = variables.input.ativo === 'S' ? 'ativado' : 'desativado';
      addToast('success', `Grupo ${label} com sucesso`);
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useCreateServico() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: (input: CreateServicoInput) => createServico(input),
    onSuccess: () => {
      addToast('success', 'Servico criado com sucesso');
      invalidate();
    },
    onError: (err) => {
      console.error('[useCreateServico] Erro ao criar servico:', err);
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useUpdateServico() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: ({ codProd, input }: { codProd: number; input: UpdateServicoInput }) =>
      updateServico(codProd, input),
    onSuccess: () => {
      addToast('success', 'Servico atualizado com sucesso');
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useMoveServico() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: ({ codProd, input }: { codProd: number; input: MoveServicoInput }) =>
      moveServico(codProd, input),
    onSuccess: () => {
      addToast('success', 'Servico movido com sucesso');
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}

export function useToggleServicoAtivo() {
  const addToast = useNotificationStore((s) => s.addToast);
  const invalidate = useInvalidateGrupos();

  return useMutation({
    mutationFn: ({ codProd, input }: { codProd: number; input: ToggleAtivoInput }) =>
      toggleServicoAtivo(codProd, input),
    onSuccess: (_, variables) => {
      const label = variables.input.ativo === 'S' ? 'ativado' : 'desativado';
      addToast('success', `Servico ${label} com sucesso`);
      invalidate();
    },
    onError: (err) => {
      addToast('error', parseApiError(err).message);
    },
  });
}
