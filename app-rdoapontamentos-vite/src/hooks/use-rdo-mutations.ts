import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import {
  createRdo, updateRdo, deleteRdo,
  addDetalhe, updateDetalhe, deleteDetalhe,
} from '@/api/rdo';
import { withOfflineQueue } from '@/utils/offline-mutation-wrapper';
import type { RdoFormData, DetalheFormData, RdoDetalheItem, RdoMotivo } from '@/types/rdo-types';

/** @deprecated Write guard removed — CRUD now allowed in PROD */
function useWriteGuard() {
  return { blocked: false, assertCanWrite: () => {} };
}

/** Invalidate all queries related to a given RDO */
function invalidateRdo(qc: ReturnType<typeof useQueryClient>, codrdo: number) {
  qc.invalidateQueries({ queryKey: ['rdo-detalhes', codrdo] });
  qc.invalidateQueries({ queryKey: ['rdo-metricas', codrdo] });
  qc.invalidateQueries({ queryKey: ['rdos'] });
  qc.invalidateQueries({ queryKey: ['admin-rdos'] });
  qc.invalidateQueries({ queryKey: ['meus-rdos'] });
  qc.invalidateQueries({ queryKey: ['rdo-stats'] });
}

export function useCreateRdo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: RdoFormData) =>
      withOfflineQueue('post', '/rdo', data, () => createRdo(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rdos'] });
      qc.invalidateQueries({ queryKey: ['admin-rdos'] });
      qc.invalidateQueries({ queryKey: ['meus-rdos'] });
      qc.invalidateQueries({ queryKey: ['rdo-stats'] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}

export function useUpdateRdo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ codrdo, data }: { codrdo: number; data: Partial<RdoFormData> }) =>
      withOfflineQueue('put', `/rdo/${codrdo}`, data, () => updateRdo(codrdo, data)),
    onSuccess: (_, { codrdo }) => {
      qc.invalidateQueries({ queryKey: ['rdos'] });
      qc.invalidateQueries({ queryKey: ['admin-rdos'] });
      qc.invalidateQueries({ queryKey: ['meus-rdos'] });
      qc.invalidateQueries({ queryKey: ['rdo', codrdo] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}

export function useDeleteRdo() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (codrdo: number) =>
      withOfflineQueue('delete', `/rdo/${codrdo}`, undefined, () => deleteRdo(codrdo)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rdos'] });
      qc.invalidateQueries({ queryKey: ['admin-rdos'] });
      qc.invalidateQueries({ queryKey: ['meus-rdos'] });
      qc.invalidateQueries({ queryKey: ['rdo-stats'] });
    },
    onError: (err: Error) => addToast('error', err.message),
  });
}

export function useAddDetalhe() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ codrdo, data }: { codrdo: number; data: DetalheFormData; motivo?: RdoMotivo }) =>
      withOfflineQueue('post', `/rdo/${codrdo}/detalhes`, data, () => addDetalhe(codrdo, data)),
    onMutate: async ({ codrdo, data, motivo }) => {
      await qc.cancelQueries({ queryKey: ['rdo-detalhes', codrdo] });
      const prev = qc.getQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo]);
      if (prev) {
        const maxItem = prev.reduce((m, d) => Math.max(m, d.ITEM), 0);
        const optimistic: RdoDetalheItem = {
          CODRDO: codrdo,
          ITEM: maxItem + 1,
          HRINI: data.HRINI ?? null,
          HRFIM: data.HRFIM ?? null,
          hriniFormatada: null,
          hrfimFormatada: null,
          duracaoMinutos: null,
          RDOMOTIVOCOD: data.RDOMOTIVOCOD ?? null,
          NUOS: data.NUOS ?? null,
          osStatus: null,
          veiculoPlaca: null,
          veiculoModelo: null,
          OBS: data.OBS ?? null,
          motivoDescricao: motivo?.DESCRICAO ?? null,
          motivoSigla: motivo?.SIGLA ?? null,
          motivoProdutivo: motivo?.PRODUTIVO ?? null,
          motivoCategoria: motivo?.WTCATEGORIA ?? null,
        };
        qc.setQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo], [...prev, optimistic]);
      }
      return { prev };
    },
    onError: (err: Error, { codrdo }, ctx) => {
      if (ctx?.prev) qc.setQueryData(['rdo-detalhes', codrdo], ctx.prev);
      addToast('error', err.message);
    },
    onSettled: (_, __, { codrdo }) => invalidateRdo(qc, codrdo),
  });
}

export function useUpdateDetalhe() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ codrdo, item, data }: { codrdo: number; item: number; data: Partial<DetalheFormData> }) =>
      withOfflineQueue('put', `/rdo/${codrdo}/detalhes/${item}`, data, () => updateDetalhe(codrdo, item, data)),
    onMutate: async ({ codrdo, item, data }) => {
      await qc.cancelQueries({ queryKey: ['rdo-detalhes', codrdo] });
      const prev = qc.getQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo]);
      if (prev) {
        qc.setQueryData<RdoDetalheItem[]>(
          ['rdo-detalhes', codrdo],
          prev.map((d) => (d.ITEM === item ? { ...d, ...data } : d)),
        );
      }
      return { prev };
    },
    onError: (err: Error, { codrdo }, ctx) => {
      if (ctx?.prev) qc.setQueryData(['rdo-detalhes', codrdo], ctx.prev);
      addToast('error', err.message);
    },
    onSettled: (_, __, { codrdo }) => invalidateRdo(qc, codrdo),
  });
}

export function useDeleteDetalhe() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ codrdo, item }: { codrdo: number; item: number }) =>
      withOfflineQueue('delete', `/rdo/${codrdo}/detalhes/${item}`, undefined, () => deleteDetalhe(codrdo, item)),
    onMutate: async ({ codrdo, item }) => {
      await qc.cancelQueries({ queryKey: ['rdo-detalhes', codrdo] });
      const prev = qc.getQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo]);
      if (prev) {
        qc.setQueryData<RdoDetalheItem[]>(
          ['rdo-detalhes', codrdo],
          prev.filter((d) => d.ITEM !== item),
        );
      }
      return { prev };
    },
    onError: (err: Error, { codrdo }, ctx) => {
      if (ctx?.prev) qc.setQueryData(['rdo-detalhes', codrdo], ctx.prev);
      addToast('error', err.message);
    },
    onSettled: (_, __, { codrdo }) => invalidateRdo(qc, codrdo),
  });
}

/**
 * Atomic switch: closes current activity + opens new one in a single cache update.
 * Both API calls fire in parallel; the UI updates instantly via one optimistic write.
 */
export function useSwitchDetalhe() {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ codrdo, closeItem, closeData, newData }: {
      codrdo: number;
      closeItem: number;
      closeData: Partial<DetalheFormData>;
      newData: DetalheFormData;
      motivo?: RdoMotivo;
    }) => {
      // Fire both API calls in parallel
      const [, added] = await Promise.all([
        withOfflineQueue('put', `/rdo/${codrdo}/detalhes/${closeItem}`, closeData,
          () => updateDetalhe(codrdo, closeItem, closeData)),
        withOfflineQueue('post', `/rdo/${codrdo}/detalhes`, newData,
          () => addDetalhe(codrdo, newData)),
      ]);
      return added;
    },
    onMutate: async ({ codrdo, closeItem, closeData, newData, motivo }) => {
      // Cancel any in-flight fetches so they don't overwrite our optimistic data
      await qc.cancelQueries({ queryKey: ['rdo-detalhes', codrdo] });
      const prev = qc.getQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo]);

      if (prev) {
        const maxItem = prev.reduce((m, d) => Math.max(m, d.ITEM), 0);

        // Single atomic cache write: close old + add new
        const next = prev.map((d) =>
          d.ITEM === closeItem ? { ...d, ...closeData } : d,
        );
        next.push({
          CODRDO: codrdo,
          ITEM: maxItem + 1,
          HRINI: newData.HRINI ?? null,
          HRFIM: newData.HRFIM ?? null,
          hriniFormatada: null,
          hrfimFormatada: null,
          duracaoMinutos: null,
          RDOMOTIVOCOD: newData.RDOMOTIVOCOD ?? null,
          NUOS: newData.NUOS ?? null,
          osStatus: null,
          veiculoPlaca: null,
          veiculoModelo: null,
          OBS: newData.OBS ?? null,
          motivoDescricao: motivo?.DESCRICAO ?? null,
          motivoSigla: motivo?.SIGLA ?? null,
          motivoProdutivo: motivo?.PRODUTIVO ?? null,
          motivoCategoria: motivo?.WTCATEGORIA ?? null,
        });

        qc.setQueryData<RdoDetalheItem[]>(['rdo-detalhes', codrdo], next);
      }
      return { prev };
    },
    onError: (err: Error, { codrdo }, ctx) => {
      if (ctx?.prev) qc.setQueryData(['rdo-detalhes', codrdo], ctx.prev);
      addToast('error', err.message);
    },
    onSettled: (_, __, { codrdo }) => invalidateRdo(qc, codrdo),
  });
}

export { useWriteGuard };
