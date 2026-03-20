import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import {
  createOs, updateOs, changeOsStatus, finalizeOs, cancelOs, reopenOs,
  addServico, updateServico, deleteServico,
  type OsCreateData, type OsUpdateData, type ServicoCreateData,
} from '@/api/ordens-servico';

function useOsMutation<TArgs extends unknown[]>(
  label: string,
  fn: (...args: TArgs) => Promise<unknown>,
) {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => {
      addToast('success', `${label} com sucesso`);
      qc.invalidateQueries({ queryKey: ['os'] });
    },
    onError: (err: Error) => {
      addToast('error', err.message || `Erro ao ${label.toLowerCase()}`);
    },
  });
}

export function useCreateOs() {
  return useOsMutation<[OsCreateData]>('OS criada', createOs);
}

export function useUpdateOs() {
  return useOsMutation<[number, OsUpdateData]>('OS atualizada', updateOs);
}

export function useChangeOsStatus() {
  return useOsMutation<[number, string, string?]>('Status alterado', changeOsStatus);
}

export function useFinalizeOs() {
  return useOsMutation<[number]>('OS finalizada', finalizeOs);
}

export function useCancelOs() {
  return useOsMutation<[number]>('OS cancelada', cancelOs);
}

export function useReopenOs() {
  return useOsMutation<[number]>('OS reaberta', reopenOs);
}

export function useAddServico() {
  return useOsMutation<[number, ServicoCreateData]>('Servico adicionado', addServico);
}

export function useUpdateServico() {
  return useOsMutation<[number, number, Partial<ServicoCreateData>]>('Servico atualizado', updateServico);
}

export function useDeleteServico() {
  return useOsMutation<[number, number]>('Servico removido', deleteServico);
}
