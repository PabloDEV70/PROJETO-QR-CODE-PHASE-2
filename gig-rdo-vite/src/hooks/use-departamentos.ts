import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface DepartamentoOpcao {
  codigo: number;
  nome: string;
}

async function fetchDepartamentos(): Promise<DepartamentoOpcao[]> {
  const { data } = await apiClient.get<{ departamentos: DepartamentoOpcao[] }>(
    '/funcionarios/filtros-opcoes',
  );
  return data.departamentos ?? [];
}

export function useDepartamentos() {
  return useQuery({
    queryKey: ['departamentos'],
    queryFn: fetchDepartamentos,
    staleTime: 10 * 60_000,
  });
}
