import { useQuery } from '@tanstack/react-query';
import {
  fetchVeiculoPerfil,
  fetchOsManutencaoAtivas,
  fetchVeiculoAbastecimentos,
  fetchVeiculoHistoricoKm,
  fetchVeiculoDocumentos,
  fetchVeiculoConsumo,
  fetchVeiculoPlanos,
  fetchVeiculoHistoricoCompleto,
} from '@/api/veiculos';

const STALE_2MIN = 2 * 60 * 1000;

export function useVeiculoPerfil(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'perfil', codveiculo],
    queryFn: () => fetchVeiculoPerfil(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useOsManutencaoAtivas(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'os-manutencao-ativas', codveiculo],
    queryFn: () => fetchOsManutencaoAtivas(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoAbastecimentos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'abastecimentos', codveiculo],
    queryFn: () => fetchVeiculoAbastecimentos(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoHistoricoKm(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'historico-km', codveiculo],
    queryFn: () => fetchVeiculoHistoricoKm(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoDocumentos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'documentos', codveiculo],
    queryFn: () => fetchVeiculoDocumentos(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoConsumo(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'consumo', codveiculo],
    queryFn: () => fetchVeiculoConsumo(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoPlanos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'planos', codveiculo],
    queryFn: () => fetchVeiculoPlanos(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}

export function useVeiculoHistoricoCompleto(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'historico-completo', codveiculo],
    queryFn: () => fetchVeiculoHistoricoCompleto(codveiculo!),
    enabled: codveiculo !== null && codveiculo > 0,
    staleTime: STALE_2MIN,
  });
}
