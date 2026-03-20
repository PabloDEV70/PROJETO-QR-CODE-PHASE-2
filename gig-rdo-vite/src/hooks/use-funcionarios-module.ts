import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  listarFuncionarios,
  getFuncionariosResumo,
  getFiltrosOpcoes,
  getFuncionarioHoraExtra,
} from '@/api/funcionarios';
import type { ListarFuncionariosParams } from '@/types/funcionario-types';

export function useFuncionariosGrid(params: ListarFuncionariosParams) {
  return useQuery({
    queryKey: ['funcionarios', 'grid', params],
    queryFn: () => listarFuncionarios(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useFuncionariosResumo() {
  return useQuery({
    queryKey: ['funcionarios', 'resumo'],
    queryFn: getFuncionariosResumo,
    staleTime: 60_000,
  });
}

export function useFiltrosOpcoes() {
  return useQuery({
    queryKey: ['funcionarios', 'filtros-opcoes'],
    queryFn: getFiltrosOpcoes,
    staleTime: 5 * 60_000,
  });
}

export function useFuncionarioHoraExtra(
  codparc: number | null | undefined,
  params?: { dataInicio?: string; dataFim?: string },
) {
  return useQuery({
    queryKey: ['funcionario', 'hora-extra', codparc, params],
    queryFn: () => getFuncionarioHoraExtra(codparc!, params),
    enabled: !!codparc && codparc > 0,
    staleTime: 60_000,
  });
}
