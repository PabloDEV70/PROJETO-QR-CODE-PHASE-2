import { useQuery } from '@tanstack/react-query';
import { getArmarios, getArmarioLocais } from '@/api/armarios';
import type { ListarArmariosParams } from '@/types/armario-types';

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
