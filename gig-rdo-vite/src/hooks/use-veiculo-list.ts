import { useQuery } from '@tanstack/react-query';

import {
  fetchVeiculosMonitoramento,
  fetchVeiculosMonitoramentoStats,
} from '@/api/veiculos';
import type { VeiculoListFilters } from '@/types/veiculo-list-types';

export function useVeiculoList(filters?: VeiculoListFilters) {
  return useQuery({
    queryKey: ['veiculos', 'monitoramento', filters],
    queryFn: () => fetchVeiculosMonitoramento(filters),
    staleTime: 60 * 1000,
  });
}

export function useVeiculoStats() {
  return useQuery({
    queryKey: ['veiculos', 'monitoramento', 'stats'],
    queryFn: fetchVeiculosMonitoramentoStats,
    staleTime: 60 * 1000,
  });
}
