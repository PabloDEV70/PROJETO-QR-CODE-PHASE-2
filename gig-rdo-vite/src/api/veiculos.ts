import { apiClient } from '@/api/client';
import type { VeiculoPerfil } from '@/types/veiculo-perfil-types';
import type {
  OsManutencaoEnriched,
  HistoricoOsUnificado,
} from '@/types/os-detalhada-types';
import type {
  VeiculoListItem,
  VeiculoMonitoramentoStats,
  VeiculoListFilters,
} from '@/types/veiculo-list-types';
import type {
  VeiculoAbastecimento,
  VeiculoHistoricoKm,
  VeiculoDocumento,
  VeiculoConsumo,
  VeiculoPlano,
  VeiculoUtilizacao,
  HistoricoCompletoItem,
} from '@/types/veiculo-tabs-types';

export async function fetchVeiculoPerfil(codveiculo: number): Promise<VeiculoPerfil> {
  const { data } = await apiClient.get<VeiculoPerfil>(
    `/veiculos/${codveiculo}/perfil`,
    { params: { include: 'osComerciais,osManutencao,contratos' } },
  );
  return data;
}

export async function fetchOsManutencaoAtivas(
  codveiculo: number,
): Promise<OsManutencaoEnriched[]> {
  const { data } = await apiClient.get<OsManutencaoEnriched[]>(
    `/veiculos/${codveiculo}/os-manutencao-ativas`,
  );
  return data;
}

export async function fetchHistoricoUnificado(
  codveiculo: number,
): Promise<HistoricoOsUnificado[]> {
  const { data } = await apiClient.get<HistoricoOsUnificado[]>(
    `/veiculos/${codveiculo}/historico-unificado`,
  );
  return data;
}

export async function fetchVeiculosMonitoramento(
  filters?: VeiculoListFilters,
): Promise<VeiculoListItem[]> {
  const params: Record<string, string> = {};
  if (filters?.status) params.status = filters.status;
  if (filters?.categoria) params.categoria = filters.categoria;
  if (filters?.comAlerta !== undefined) params.comAlerta = String(filters.comAlerta);
  const { data } = await apiClient.get<VeiculoListItem[]>(
    '/veiculos/monitoramento',
    { params },
  );
  return data;
}

export async function fetchVeiculosMonitoramentoStats(): Promise<VeiculoMonitoramentoStats> {
  const { data } = await apiClient.get<VeiculoMonitoramentoStats>(
    '/veiculos/monitoramento/stats',
  );
  return data;
}

export async function fetchVeiculosSearch(q: string): Promise<VeiculoListItem[]> {
  const { data } = await apiClient.get<VeiculoListItem[]>(
    '/veiculos/search',
    { params: { q } },
  );
  return data;
}

export async function fetchVeiculoAbastecimentos(
  codveiculo: number,
): Promise<VeiculoAbastecimento[]> {
  const { data } = await apiClient.get<VeiculoAbastecimento[]>(
    `/veiculos/${codveiculo}/abastecimentos`,
  );
  return data;
}

export async function fetchVeiculoHistoricoKm(
  codveiculo: number,
): Promise<VeiculoHistoricoKm[]> {
  const { data } = await apiClient.get<VeiculoHistoricoKm[]>(
    `/veiculos/${codveiculo}/historico-km`,
  );
  return data;
}

export async function fetchVeiculoDocumentos(
  codveiculo: number,
): Promise<VeiculoDocumento[]> {
  const { data } = await apiClient.get<VeiculoDocumento[]>(
    `/veiculos/${codveiculo}/documentos`,
  );
  return data;
}

export async function fetchVeiculoConsumo(
  codveiculo: number,
): Promise<VeiculoConsumo[]> {
  const { data } = await apiClient.get<VeiculoConsumo[]>(
    `/veiculos/${codveiculo}/consumo`,
  );
  return data;
}

export async function fetchVeiculoPlanos(
  codveiculo: number,
): Promise<VeiculoPlano[]> {
  const { data } = await apiClient.get<VeiculoPlano[]>(
    `/veiculos/${codveiculo}/planos-preventivos`,
  );
  return data;
}

export async function fetchVeiculoUtilizacao(
  codveiculo: number,
  dataInicio?: string,
  dataFim?: string,
): Promise<VeiculoUtilizacao> {
  const params: Record<string, string> = {};
  if (dataInicio) params.dataInicio = dataInicio;
  if (dataFim) params.dataFim = dataFim;
  const { data } = await apiClient.get<VeiculoUtilizacao>(
    `/veiculos/${codveiculo}/utilizacao`,
    { params },
  );
  return data;
}

export async function fetchVeiculoHistoricoCompleto(
  codveiculo: number,
): Promise<HistoricoCompletoItem[]> {
  const { data } = await apiClient.get<HistoricoCompletoItem[]>(
    `/veiculos/${codveiculo}/historico-completo`,
  );
  return data;
}
