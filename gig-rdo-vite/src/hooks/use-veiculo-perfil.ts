import { useQuery } from '@tanstack/react-query';
import {
  fetchVeiculoPerfil,
  fetchOsManutencaoAtivas,
  fetchHistoricoUnificado,
  fetchVeiculoAbastecimentos,
  fetchVeiculoHistoricoKm,
  fetchVeiculoDocumentos,
  fetchVeiculoConsumo,
  fetchVeiculoPlanos,
  fetchVeiculoUtilizacao,
  fetchVeiculoHistoricoCompleto,
} from '@/api/veiculos';

export function useVeiculoPerfil(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'perfil', codveiculo],
    queryFn: () => fetchVeiculoPerfil(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOsManutencaoAtivas(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'os-manutencao-ativas', codveiculo],
    queryFn: () => fetchOsManutencaoAtivas(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHistoricoUnificado(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'historico-unificado', codveiculo],
    queryFn: () => fetchHistoricoUnificado(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoAbastecimentos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'abastecimentos', codveiculo],
    queryFn: () => fetchVeiculoAbastecimentos(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoHistoricoKm(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'historico-km', codveiculo],
    queryFn: () => fetchVeiculoHistoricoKm(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoDocumentos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'documentos', codveiculo],
    queryFn: () => fetchVeiculoDocumentos(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoConsumo(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'consumo', codveiculo],
    queryFn: () => fetchVeiculoConsumo(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoPlanos(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'planos', codveiculo],
    queryFn: () => fetchVeiculoPlanos(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVeiculoUtilizacao(
  codveiculo: number | null,
  dataInicio?: string,
  dataFim?: string,
) {
  return useQuery({
    queryKey: ['veiculo', 'utilizacao', codveiculo, dataInicio, dataFim],
    queryFn: () => fetchVeiculoUtilizacao(codveiculo!, dataInicio, dataFim),
    enabled: codveiculo !== null,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVeiculoHistoricoCompleto(codveiculo: number | null) {
  return useQuery({
    queryKey: ['veiculo', 'historico-completo', codveiculo],
    queryFn: () => fetchVeiculoHistoricoCompleto(codveiculo!),
    enabled: codveiculo !== null,
    staleTime: 2 * 60 * 1000,
  });
}
