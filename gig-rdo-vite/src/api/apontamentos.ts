import { apiClient } from '@/api/client';
import type {
  ApontamentoResumo,
  ApontamentoPendente,
  ApontamentoComOs,
  ServicoFrequente,
  ProdutoUtilizado,
  ApontamentoByVeiculo,
  ApontamentoTimeline,
  ApontamentoServico,
  PaginationParams,
  PeriodoParams,
} from '@/types/apontamentos-types';

export async function getApontamentosResumo(): Promise<ApontamentoResumo> {
  const { data } = await apiClient.get<ApontamentoResumo>('/apontamentos/resumo');
  return data;
}

export async function getApontamentosPendentes(
  params: PaginationParams = {},
): Promise<ApontamentoPendente[]> {
  const { data } = await apiClient.get<ApontamentoPendente[]>(
    '/apontamentos/pendentes',
    { params },
  );
  return data;
}

export async function getApontamentosComOs(
  params: PaginationParams = {},
): Promise<ApontamentoComOs[]> {
  const { data } = await apiClient.get<ApontamentoComOs[]>(
    '/apontamentos/com-os',
    { params },
  );
  return data;
}

export async function getServicosFrequentes(): Promise<ServicoFrequente[]> {
  const { data } = await apiClient.get<ServicoFrequente[]>(
    '/apontamentos/servicos-frequentes',
  );
  return data;
}

export async function getProdutosUtilizados(): Promise<ProdutoUtilizado[]> {
  const { data } = await apiClient.get<ProdutoUtilizado[]>('/apontamentos/por-produto');
  return data;
}

export async function getApontamentosByVeiculo(
  codveiculo?: number,
): Promise<ApontamentoByVeiculo[]> {
  const { data } = await apiClient.get<ApontamentoByVeiculo[]>(
    '/apontamentos/por-veiculo',
    { params: codveiculo ? { codveiculo } : {} },
  );
  return data;
}

export async function getApontamentosByPeriodo(
  params: PeriodoParams,
): Promise<ApontamentoServico[]> {
  const { data } = await apiClient.get<ApontamentoServico[]>(
    '/apontamentos/por-periodo',
    { params },
  );
  return data;
}

export async function getApontamentosTimeline(
  codveiculo: number,
  params: PaginationParams = {},
): Promise<ApontamentoTimeline[]> {
  const { data } = await apiClient.get<ApontamentoTimeline[]>(
    `/apontamentos/veiculo/${codveiculo}/timeline`,
    { params },
  );
  return data;
}

export async function getApontamentoByCode(
  codigo: number,
): Promise<ApontamentoServico[]> {
  const { data } = await apiClient.get<ApontamentoServico[]>(
    `/apontamentos/${codigo}`,
  );
  return data;
}
