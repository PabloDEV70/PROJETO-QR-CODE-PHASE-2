import { useQuery } from '@tanstack/react-query';
import { listarFuncionarios } from '@/api/funcionarios';

export function useFuncionariosLista(coddep: string | null) {
  return useQuery({
    queryKey: ['funcionarios', 'lista', coddep],
    queryFn: () => {
      const params: Record<string, string | number> = {
        situacao: '1',
        limit: 200,
        orderBy: 'nomeparc',
        orderDir: 'ASC',
      };
      if (coddep) params.coddep = Number(coddep);
      return listarFuncionarios(params);
    },
    staleTime: 5 * 60_000,
  });
}
