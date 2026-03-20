import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import { withOfflineQueue } from '@/utils/offline-mutation-wrapper';
import {
  criarSituacao, atualizarSituacao, encerrarSituacao, trocarSituacao,
} from '@/api/hstvei';
import type { CriarSituacaoPayload, AtualizarSituacaoPayload, TrocarSituacaoPayload } from '@/types/hstvei-types';

function getCurrentCodUsu(): number {
  return useAuthStore.getState().user?.codusu ?? 0;
}

export function useCriarSituacao() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CriarSituacaoPayload) => {
      const codUsu = getCurrentCodUsu();
      console.log('[useCriarSituacao] CODUSU:', codUsu, 'payload:', JSON.stringify(payload));
      return withOfflineQueue('post', '/hstvei', { ...payload, codUsuInc: codUsu }, () => criarSituacao({ ...payload, codUsuInc: codUsu }));
    },
    onSuccess: (data) => {
      console.log('[useCriarSituacao] SUCCESS:', data);
      addToast('success', 'Situacao criada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => {
      console.error('[useCriarSituacao] ERROR:', err.message, err);
      addToast('error', err.message || 'Erro ao criar situacao');
    },
  });
}

export function useAtualizarSituacao() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AtualizarSituacaoPayload }) => {
      const codUsu = getCurrentCodUsu();
      return withOfflineQueue('put', `/hstvei/${id}`, { ...payload, codUsuAlt: codUsu }, () => atualizarSituacao(id, { ...payload, codUsuAlt: codUsu }));
    },
    onSuccess: () => {
      addToast('success', 'Situacao atualizada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => addToast('error', err.message || 'Erro ao atualizar situacao'),
  });
}

export function useEncerrarSituacao() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: number) => {
      const codUsu = getCurrentCodUsu();
      return withOfflineQueue('patch', `/hstvei/${id}/encerrar`, { codUsuAlt: codUsu }, () => encerrarSituacao(id, codUsu));
    },
    onSuccess: () => {
      addToast('success', 'Situacao encerrada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => addToast('error', err.message || 'Erro ao encerrar situacao'),
  });
}

export function useTrocarSituacao() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TrocarSituacaoPayload }) => {
      const codUsu = getCurrentCodUsu();
      return withOfflineQueue('patch', `/hstvei/${id}/trocar-situacao`, { ...payload, codUsuAlt: codUsu }, () => trocarSituacao(id, { ...payload, codUsuAlt: codUsu }));
    },
    onSuccess: () => {
      addToast('success', 'Situacao trocada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => addToast('error', err.message || 'Erro ao trocar situacao'),
  });
}
