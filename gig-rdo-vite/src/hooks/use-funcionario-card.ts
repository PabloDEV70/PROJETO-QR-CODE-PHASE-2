import { useQuery } from '@tanstack/react-query';
import { getFuncionarioCardPublico } from '@/api/funcionarios';

export function useFuncionarioCard(codemp: number, codfunc: number) {
  return useQuery({
    queryKey: ['funcionario', 'card-publico', codemp, codfunc],
    queryFn: () => getFuncionarioCardPublico(codemp, codfunc),
    staleTime: 5 * 60 * 1000,
    enabled: codemp > 0 && codfunc > 0,
  });
}
