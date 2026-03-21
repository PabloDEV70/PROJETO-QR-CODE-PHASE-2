import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';
import {
  getApontamentos,
  getApontamentoServicos,
  createApontamento,
  updateApontamento,
  deleteApontamento,
  addServico,
  updateServico,
  deleteServico,
} from '@/api/apontamentos';
import type { ApontamentoListParams, ApontamentoFormData, ServicoFormData } from '@/types/apontamento-types';

export function useApontamentosList(params: ApontamentoListParams) {
  return useQuery({
    queryKey: ['apontamentos', 'list', params],
    queryFn: () => getApontamentos(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useApontamentoServicos(codigo: number | null) {
  return useQuery({
    queryKey: ['apontamentos', 'servicos', codigo],
    queryFn: () => getApontamentoServicos(codigo!),
    enabled: !!codigo,
    staleTime: 30_000,
  });
}

function useApontMutation<TArgs extends unknown[]>(
  label: string,
  fn: (...args: TArgs) => Promise<unknown>,
) {
  const qc = useQueryClient();
  const addToast = useNotificationStore((s) => s.addToast);

  return useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => {
      addToast('success', `${label} com sucesso`);
      qc.invalidateQueries({ queryKey: ['apontamentos'] });
    },
    onError: (err: Error) => {
      addToast('error', err.message || `Erro ao ${label.toLowerCase()}`);
    },
  });
}

export function useCreateApontamento() {
  return useApontMutation<[ApontamentoFormData, number?]>(
    'Apontamento criado',
    createApontamento,
  );
}

export function useUpdateApontamento() {
  return useApontMutation<[number, ApontamentoFormData]>(
    'Apontamento atualizado',
    updateApontamento,
  );
}

export function useDeleteApontamento() {
  return useApontMutation<[number]>(
    'Apontamento excluido',
    deleteApontamento,
  );
}

export function useAddServico() {
  return useApontMutation<[number, ServicoFormData]>(
    'Servico adicionado',
    addServico,
  );
}

export function useUpdateServico() {
  return useApontMutation<[number, number, ServicoFormData]>(
    'Servico atualizado',
    updateServico,
  );
}

export function useDeleteServico() {
  return useApontMutation<[number, number]>(
    'Servico removido',
    deleteServico,
  );
}
