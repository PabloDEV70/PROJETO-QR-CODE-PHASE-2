import { useQuery } from '@tanstack/react-query';
import { getOsById, getOsServicos } from '@/api/os-manutencao';

export function useOsDetalhes(nuos: number | null) {
  return useQuery({
    queryKey: ['os-manutencao', nuos],
    queryFn: () => getOsById(nuos!),
    enabled: !!nuos,
    staleTime: 60 * 1000,
  });
}

export function useOsServicos(nuos: number | null) {
  return useQuery({
    queryKey: ['os-manutencao', nuos, 'servicos'],
    queryFn: () => getOsServicos(nuos!),
    enabled: !!nuos,
    staleTime: 60 * 1000,
  });
}
