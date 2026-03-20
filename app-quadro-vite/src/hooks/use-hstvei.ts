import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchPainel,
  fetchStats,
  fetchSituacoes,
  fetchPrioridades,
  fetchById,
  fetchHstVeiList,
  criarSituacao,
  atualizarSituacao,
  encerrarSituacao,
  trocarSituacao,
  createSituacao,
  updateSituacao,
  deleteSituacao,
  createPrioridade,
  updatePrioridade,
  deletePrioridade,
} from '@/api/hstvei';
import type { ListHstVeiParams } from '@/api/hstvei';
import type { CriarSituacaoPayload, AtualizarSituacaoPayload, TrocarSituacaoPayload } from '@/types/hstvei-types';
import { parseApiError } from '@/types/api-error';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function getCurrentCodUsu(): number {
  return useAuthStore.getState().user?.codusu ?? 0;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Painel completo (dashboard / quadro kanban) */
export function useHstVeiPainel() {
  return useQuery({
    queryKey: ['hstvei', 'painel'],
    queryFn: fetchPainel,
    staleTime: 30_000,
  });
}

/** KPIs / contadores */
export function useHstVeiStats() {
  return useQuery({
    queryKey: ['hstvei', 'stats'],
    queryFn: fetchStats,
    staleTime: 30_000,
  });
}

/** Lista paginada com filtros (DataGrid) */
export function useHstVeiList(params: ListHstVeiParams) {
  return useQuery({
    queryKey: ['hstvei', 'list', params],
    queryFn: () => fetchHstVeiList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/** Detalhe de um registro */
export function useHstVeiDetail(id: number | null) {
  return useQuery({
    queryKey: ['hstvei', 'detail', id],
    queryFn: () => fetchById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30_000,
  });
}

/** Lookup: situacoes */
export function useSituacoes() {
  return useQuery({
    queryKey: ['hstvei', 'situacoes'],
    queryFn: fetchSituacoes,
    staleTime: 5 * 60_000,
  });
}

/** Lookup: prioridades */
export function usePrioridades() {
  return useQuery({
    queryKey: ['hstvei', 'prioridades'],
    queryFn: fetchPrioridades,
    staleTime: 5 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateHstVei() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CriarSituacaoPayload) => {
      const codUsu = getCurrentCodUsu();
      return criarSituacao({ ...payload, codUsuInc: codUsu });
    },
    onSuccess: () => {
      addToast('success', 'Situacao criada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => {
      addToast('error', err.message || 'Erro ao criar situacao');
    },
  });
}

export function useUpdateHstVei() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AtualizarSituacaoPayload }) => {
      const codUsu = getCurrentCodUsu();
      return atualizarSituacao(id, { ...payload, codUsuAlt: codUsu });
    },
    onSuccess: () => {
      addToast('success', 'Situacao atualizada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => addToast('error', err.message || 'Erro ao atualizar situacao'),
  });
}

export function useEncerrarHstVei() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: number) => {
      const codUsu = getCurrentCodUsu();
      return encerrarSituacao(id, codUsu);
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
      return trocarSituacao(id, { ...payload, codUsuAlt: codUsu });
    },
    onSuccess: () => {
      addToast('success', 'Situacao trocada com sucesso');
      qc.invalidateQueries({ queryKey: ['hstvei'] });
    },
    onError: (err: Error) => addToast('error', err.message || 'Erro ao trocar situacao'),
  });
}

// ---------------------------------------------------------------------------
// Situacoes Config CRUD
// ---------------------------------------------------------------------------

export function useCreateSituacao() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { DESCRICAO: string; CODDEP: number; OBS?: string }) => createSituacao(input),
    onSuccess: () => { addToast('success', 'Situacao criada'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}

export function useUpdateSituacao() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Record<string, unknown> }) => updateSituacao(id, input),
    onSuccess: () => { addToast('success', 'Situacao atualizada'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}

export function useDeleteSituacao() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSituacao(id),
    onSuccess: () => { addToast('success', 'Situacao removida'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}

// ---------------------------------------------------------------------------
// Prioridades Config CRUD
// ---------------------------------------------------------------------------

export function useCreatePrioridade() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { IDPRI: number; SIGLA: string; DESCRICAO: string }) => createPrioridade(input),
    onSuccess: () => { addToast('success', 'Prioridade criada'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}

export function useUpdatePrioridade() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idpri, input }: { idpri: number; input: Record<string, unknown> }) => updatePrioridade(idpri, input),
    onSuccess: () => { addToast('success', 'Prioridade atualizada'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}

export function useDeletePrioridade() {
  const addToast = useNotificationStore((s) => s.addToast);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idpri: number) => deletePrioridade(idpri),
    onSuccess: () => { addToast('success', 'Prioridade removida'); qc.invalidateQueries({ queryKey: ['hstvei'] }); },
    onError: (err) => { addToast('error', parseApiError(err).message); },
  });
}
