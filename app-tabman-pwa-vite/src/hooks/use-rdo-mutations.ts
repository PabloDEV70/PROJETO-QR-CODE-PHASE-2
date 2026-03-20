import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchRdoDia, createRdo, addDetalhe, updateDetalhe, fetchDetalhes, startOsServico, finishOsServico } from '@/api/rdo';
import { agoraHhmm } from '@/utils/hora-utils';
import { useNotificationStore } from '@/stores/notification-store';
import type { DetalheFormData } from '@/types/rdo-types';

interface MutationCallbacks {
  onDone?: () => void;
}

export function useRdoMutations(codparc: number, callbacks?: MutationCallbacks) {
  const qc = useQueryClient();
  const hoje = format(new Date(), 'yyyy-MM-dd');
  const addToast = useNotificationStore((s) => s.addToast);
  const onDone = callbacks?.onDone;

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['rdo-dia'] });
    qc.invalidateQueries({ queryKey: ['rdo-detalhes'] });
    qc.invalidateQueries({ queryKey: ['rdo-metricas'] });
    qc.invalidateQueries({ queryKey: ['quem-faz'] });
  };

  const ensureRdo = async (dtref?: string): Promise<number> => {
    const data = dtref || hoje;
    const existing = await fetchRdoDia(codparc, data);
    if (existing.data?.length > 0) return existing.data[0].CODRDO;
    const result = await createRdo(codparc, data);
    refetchAll();
    return result.dadosInseridos?.CODRDO ?? result.codrdo;
  };

  const closeAllActive = async (codrdo: number) => {
    const now = agoraHhmm();
    const detalhes = await fetchDetalhes(codrdo);
    const ativas = (Array.isArray(detalhes) ? detalhes : [])
      .filter((d) => d.HRFIM === (d.HRINI ?? 0) + 1);
    for (const d of ativas) {
      console.log('[tabman] fechando item', d.ITEM, 'HRFIM=', now);
      await updateDetalhe(codrdo, d.ITEM, { HRFIM: now });
    }
  };

  const startActivity = useMutation({
    mutationFn: async (form: DetalheFormData) => {
      const codrdo = await ensureRdo();
      await closeAllActive(codrdo);
      const now = agoraHhmm();
      const result = await addDetalhe(codrdo, { ...form, HRINI: now, HRFIM: now + 1 });
      if (form.NUOS && form.AD_SEQUENCIA_OS) {
        try { await startOsServico(form.NUOS, form.AD_SEQUENCIA_OS, codparc); }
        catch (err) { console.warn('[tabman] OS start failed (non-blocking)', err); }
      }
      return result;
    },
    onSuccess: () => { addToast('success', 'Atividade iniciada'); onDone?.(); },
    onError: (err) => { console.error('[tabman] start ERRO', err); addToast('error', 'Erro ao iniciar'); },
    onSettled: () => { refetchAll(); qc.invalidateQueries({ queryKey: ['os-servicos'] }); },
  });

  const stopActivity = useMutation({
    mutationFn: async ({ codrdo }: { codrdo: number; item: number }) => {
      await closeAllActive(codrdo);
    },
    onSuccess: () => { addToast('success', 'Atividade parada'); onDone?.(); },
    onError: (err) => { console.error('[tabman] stop ERRO', err); addToast('error', 'Erro ao parar'); },
    onSettled: () => { refetchAll(); },
  });

  const switchActivity = useMutation({
    mutationFn: async ({ codrdo, form }: { codrdo: number; currentItem: number; form: DetalheFormData }) => {
      await closeAllActive(codrdo);
      const now = agoraHhmm();
      const result = await addDetalhe(codrdo, { ...form, HRINI: now, HRFIM: now + 1 });
      if (form.NUOS && form.AD_SEQUENCIA_OS) {
        try { await startOsServico(form.NUOS, form.AD_SEQUENCIA_OS, codparc); }
        catch (err) { console.warn('[tabman] OS start failed (non-blocking)', err); }
      }
      return result;
    },
    onSuccess: () => { addToast('success', 'Atividade trocada'); onDone?.(); },
    onError: (err) => { console.error('[tabman] switch ERRO', err); addToast('error', 'Erro ao trocar'); },
    onSettled: () => { refetchAll(); qc.invalidateQueries({ queryKey: ['os-servicos'] }); },
  });

  const finishServico = useMutation({
    mutationFn: async ({ codrdo, nuos, sequencia }: { codrdo: number; nuos: number; sequencia: number }) => {
      await closeAllActive(codrdo);
      return finishOsServico(nuos, sequencia, codparc);
    },
    onSuccess: (data) => {
      const msg = data?.osAutoFinalized ? 'Servico finalizado (OS concluida)' : 'Servico finalizado';
      addToast('success', msg);
      onDone?.();
    },
    onError: (err) => { console.error('[tabman] finishServico ERRO', err); addToast('error', 'Erro ao finalizar servico'); },
    onSettled: () => { refetchAll(); qc.invalidateQueries({ queryKey: ['os-abertas'] }); qc.invalidateQueries({ queryKey: ['os-servicos'] }); },
  });

  return { ensureRdo, startActivity, stopActivity, switchActivity, finishServico };
}
