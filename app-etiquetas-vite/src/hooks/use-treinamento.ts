import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  listarColaboradores,
  listarTreinamentosDoColaborador,
  getFiltroOpcoes,
  getTreinamentosTodos,
} from '@/api/treinamentos';
import type { ListarTreinamentosParams, TreinamentoListResponse } from '@/types/treinamento-types';

export function useColaboradoresList(params: ListarTreinamentosParams) {
  return useQuery({
    queryKey: ['colaboradores', params],
    queryFn: () => listarColaboradores(params),
    placeholderData: keepPreviousData,
  });
}

// Hook para listar treinamentos de um colaborador
export function useTreinamentosDoColaborador(codfunc: number | null) {
  return useQuery<TreinamentoListResponse, Error>({
    queryKey: ['treinamentos', codfunc],
    queryFn: async () => {
      const result = await listarTreinamentosDoColaborador(codfunc!);
      // Garantir que data é sempre um array
      return {
        ...result,
        data: Array.isArray(result?.data) ? result.data : [],
      };
    },
    enabled: codfunc !== null,
  });
}

export function useFiltroOpcoes() {
  return useQuery({
    queryKey: ['treinamentos', 'filtros'],
    queryFn: getFiltroOpcoes,
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

export function useColaboradoresTodos(coddep?: number) {
  return useQuery({
    queryKey: ['colaboradores', 'todos', coddep],
    queryFn: () => getTreinamentosTodos({ coddep }),
    placeholderData: keepPreviousData,
  });
}
