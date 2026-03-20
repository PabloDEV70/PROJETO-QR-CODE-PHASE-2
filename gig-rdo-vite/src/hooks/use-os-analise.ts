import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getAnaliseTipoVeiculo, getTendenciaTipoVeiculo } from '@/api/os-analise';
import type { OsAnaliseParams } from '@/types/os-analise-types';

export function useAnaliseTipoVeiculo(params: OsAnaliseParams) {
  return useQuery({
    queryKey: ['os', 'analise-tipo-veiculo', params],
    queryFn: () => getAnaliseTipoVeiculo(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useTendenciaTipoVeiculo(tipoVeiculo: string | null) {
  return useQuery({
    queryKey: ['os', 'tendencia-tipo-veiculo', tipoVeiculo],
    queryFn: () => getTendenciaTipoVeiculo(tipoVeiculo!),
    enabled: !!tipoVeiculo,
    staleTime: 60 * 1000,
  });
}
