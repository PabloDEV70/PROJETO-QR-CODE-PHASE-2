import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface VeiculoItem {
  codveiculo: number;
  placa: string;
  marcamodelo: string | null;
  tag: string | null;
  categoria: string | null;
  tipo: string | null;
  ativo: string | null;
}

async function fetchVeiculos(): Promise<VeiculoItem[]> {
  const { data } = await apiClient.get('/veiculos', { params: { limit: 100 } });
  return Array.isArray(data) ? data : data.data ?? data;
}

export function useVeiculos() {
  return useQuery({
    queryKey: ['veiculos-all'],
    queryFn: fetchVeiculos,
    staleTime: 10 * 60_000,
    retry: false,
  });
}
