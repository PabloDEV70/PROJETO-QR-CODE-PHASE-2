import { useQuery } from '@tanstack/react-query';
import { getArmarioFuncionario, getArmarioPublico, getArmarios, getArmarioLocais } from '@/api/armarios';
import type { ListarArmariosParams } from '@/types/armario-types';

export function useArmarioFuncionario(
  codemp: number | null | undefined,
  codfunc: number | null | undefined,
) {
  const isValid = codemp != null && codfunc != null && codemp > 0 && codfunc > 0;
  return useQuery({
    queryKey: ['armario', 'funcionario', codemp, codfunc],
    queryFn: () => getArmarioFuncionario(codemp!, codfunc!),
    enabled: isValid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArmarioPublico(codarmario: number | null | undefined) {
  const isValid = codarmario != null && codarmario > 0;
  return useQuery({
    queryKey: ['armario', 'publico', codarmario],
    queryFn: () => getArmarioPublico(codarmario!),
    enabled: isValid,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArmariosList(params: ListarArmariosParams) {
  return useQuery({
    queryKey: ['armarios', 'list', params],
    queryFn: () => getArmarios(params),
    staleTime: 30 * 1000,
  });
}

export function useArmarioLocais() {
  return useQuery({
    queryKey: ['armarios', 'locais'],
    queryFn: getArmarioLocais,
    staleTime: 5 * 60 * 1000,
  });
}
