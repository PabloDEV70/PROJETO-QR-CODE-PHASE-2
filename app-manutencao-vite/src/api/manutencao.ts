import { apiClient } from '@/api/client';
import type {
  OsKpis, OsDashboardData, OsAlerta, OsAtivaDetalhada,
  OsMediaDias, VeiculoMultiplasOs, PlanoManutencao, AderenciaPlano,
  PlanoResumo, TecnicoProdutividade,
  VeiculoDashboard, ProximaManutencao, VeiculoHistorico,
  VeiculoCusto, FrotaStatusResponse, ManutencaoUrgente,
  ServicoFrequente, TempoServicosResponse, PerfServicoResponse,
  GrupoArvore, ServicoGrupo, ServicoComExecucao, PerfServicoExecucao,
} from '@/types/os-types';

interface DateRangeParams {
  dataInicio?: string;
  dataFim?: string;
}

// --- KPIs & Dashboard ---

export async function getOsKpis(params?: DateRangeParams): Promise<OsKpis> {
  const { data } = await apiClient.get<OsKpis>('/man/kpis', { params });
  return data;
}

export async function getManDashboard(): Promise<OsDashboardData> {
  const { data } = await apiClient.get<OsDashboardData>('/man/dashboard');
  return data;
}

// --- Alertas ---

export async function getAlertas(): Promise<OsAlerta[]> {
  const { data } = await apiClient.get<OsAlerta[]>('/man/alertas');
  return data;
}

export async function getOsAtivasDetalhadas(limit?: number): Promise<OsAtivaDetalhada[]> {
  const { data } = await apiClient.get<OsAtivaDetalhada[]>('/man/ativas', {
    params: limit ? { limit } : undefined,
  });
  return data;
}

export async function getVeiculosMultiplasOs(): Promise<VeiculoMultiplasOs[]> {
  const { data } = await apiClient.get<VeiculoMultiplasOs[]>('/man/veiculos-multiplas-os');
  return data;
}

export async function getMediaDiasPorTipo(): Promise<OsMediaDias[]> {
  const { data } = await apiClient.get<OsMediaDias[]>('/man/media-dias');
  return data;
}

// --- Planos Preventivos ---

export async function getPlanos(): Promise<PlanoManutencao[]> {
  const { data } = await apiClient.get<PlanoManutencao[]>('/man/planos');
  return data;
}

export async function getPlanosAderencia(params?: {
  situacao?: string;
  codveiculo?: number;
}): Promise<AderenciaPlano[]> {
  const { data } = await apiClient.get('/man/planos/aderencia', { params });
  return Array.isArray(data) ? data : (data as { data: AderenciaPlano[] }).data ?? [];
}

export async function getPlanosAtrasadas(): Promise<AderenciaPlano[]> {
  const { data } = await apiClient.get('/man/planos/atrasadas');
  // Backend returns AderenciaPlano[] directly; guard against envelope
  return Array.isArray(data) ? data : (data as { data: AderenciaPlano[] }).data ?? [];
}

export async function getPlanosResumo(): Promise<PlanoResumo> {
  const { data } = await apiClient.get<PlanoResumo>('/man/planos/resumo');
  return data;
}

// --- Ranking / Produtividade ---

export async function getTecnicosProdutividade(params?: DateRangeParams): Promise<TecnicoProdutividade[]> {
  const { data } = await apiClient.get<TecnicoProdutividade[]>('/man/tecnicos/produtividade', { params });
  return data;
}

export async function getTecnicoProdutividade(
  codusu: number,
  params?: DateRangeParams,
): Promise<TecnicoProdutividade> {
  const { data } = await apiClient.get<TecnicoProdutividade>(
    `/man/tecnicos/${codusu}/produtividade`,
    { params },
  );
  return data;
}

// --- Veiculo Detail ---

export async function getVeiculoDashboard(codveiculo: number): Promise<VeiculoDashboard> {
  const { data } = await apiClient.get<VeiculoDashboard>(`/veiculos/${codveiculo}/dashboard`);
  return data;
}

export async function getVeiculoProximaManutencao(codveiculo: number): Promise<ProximaManutencao[]> {
  const { data } = await apiClient.get<ProximaManutencao[]>(
    `/veiculos/${codveiculo}/proxima-manutencao`,
  );
  return data;
}

export async function getVeiculoAderencia(codveiculo: number): Promise<{ score: number }> {
  const { data } = await apiClient.get<{ score: number }>(
    `/veiculos/${codveiculo}/aderencia-plano`,
  );
  return data;
}

export async function getVeiculoHistorico(
  codveiculo: number,
  params?: { status?: string; tipo?: string; dataInicio?: string; dataFim?: string },
): Promise<VeiculoHistorico[]> {
  const { data } = await apiClient.get<{ data: VeiculoHistorico[] }>(
    `/veiculos/${codveiculo}/historico`,
    { params },
  );
  return data.data;
}

export async function getVeiculoCustos(
  codveiculo: number,
  params?: DateRangeParams,
): Promise<VeiculoCusto[]> {
  const { data } = await apiClient.get<VeiculoCusto[]>(
    `/veiculos/${codveiculo}/custos`,
    { params },
  );
  return data;
}

export async function getVeiculoRetrabalho(codveiculo: number): Promise<unknown[]> {
  const { data } = await apiClient.get(`/veiculos/${codveiculo}/retrabalho`);
  return data as unknown[];
}

// --- Frota ---

export async function getFrotaStatus(): Promise<FrotaStatusResponse> {
  const { data } = await apiClient.get<FrotaStatusResponse>('/man/frota/status');
  return data;
}

export async function getFrotaManutencoesUrgentes(): Promise<ManutencaoUrgente[]> {
  const { data } = await apiClient.get<{ data: ManutencaoUrgente[] }>('/man/frota/manutencoes-urgentes');
  return data.data;
}

export async function getVeiculoServicosFrequentes(codveiculo: number): Promise<ServicoFrequente[]> {
  const { data } = await apiClient.get<ServicoFrequente[]>(
    `/veiculos/${codveiculo}/servicos-frequentes`,
  );
  return data;
}

// --- Tempo Servicos ---

export async function getTempoServicos(params?: {
  dataInicio?: string;
  dataFim?: string;
  codexec?: number;
  codGrupoProd?: number;
}): Promise<TempoServicosResponse> {
  const { data } = await apiClient.get<TempoServicosResponse>('/man/tempo-servicos', { params });
  return data;
}

// --- Servicos com Execucao ---

export async function getServicosComExecucao(): Promise<ServicoComExecucao[]> {
  const { data } = await apiClient.get<ServicoComExecucao[]>('/man/servicos-com-execucao');
  return data;
}

// --- Grupos Arvore + Servicos ---

export async function getGruposArvore(): Promise<GrupoArvore[]> {
  const { data } = await apiClient.get<GrupoArvore[]>('/man/grupos-arvore');
  return data;
}

export async function getServicosPorGrupo(codGrupo: number): Promise<ServicoGrupo[]> {
  const { data } = await apiClient.get<ServicoGrupo[]>(
    '/man/servicos-por-grupo', { params: { codGrupo } },
  );
  return data;
}

// --- Performance Servico x Executor ---

export async function getPerformanceServicoExecutor(params: {
  codprod: number;
  dataInicio?: string;
  dataFim?: string;
}): Promise<PerfServicoResponse> {
  const { data } = await apiClient.get<PerfServicoResponse>(
    '/man/performance-servico-executor', { params },
  );
  return data;
}

export async function getPerformanceServicoExecucoes(params: {
  codprod: number;
  dataInicio?: string;
  dataFim?: string;
}): Promise<PerfServicoExecucao[]> {
  const { data } = await apiClient.get<PerfServicoExecucao[]>(
    '/man/performance-servico-execucoes', { params },
  );
  return data;
}

// --- OS History ---

export async function getOsHistorico(nuos: number): Promise<unknown[]> {
  const { data } = await apiClient.get(`/man/os/${nuos}/historico`);
  return data as unknown[];
}
