import { useQuery } from '@tanstack/react-query';

import {
  fetchPatrimonioMobilizacao,
  fetchPatrimonioMobilizacaoVeiculos,
} from '@/api/patrimonio';

export function usePatrimonioMobilizacao() {
  return useQuery({
    queryKey: ['patrimonio', 'mobilizacao'],
    queryFn: fetchPatrimonioMobilizacao,
    staleTime: 60 * 1000,
  });
}

export function usePatrimonioMobilizacaoVeiculos() {
  return useQuery({
    queryKey: ['patrimonio', 'mobilizacao', 'veiculos'],
    queryFn: fetchPatrimonioMobilizacaoVeiculos,
    staleTime: 60 * 1000,
  });
}
