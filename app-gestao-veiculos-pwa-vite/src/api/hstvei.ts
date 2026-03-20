import { apiClient } from '@/api/client';
import type {
  PainelResponse, HstVeiStats, Situacao, Prioridade,
  HstVeiEnriched, CriarSituacaoPayload, AtualizarSituacaoPayload,
  TrocarSituacaoPayload, HistoricoResponse, CadeiaNotaItem, ItemNota,
} from '@/types/hstvei-types';

export async function fetchPainel(): Promise<PainelResponse> {
  const { data } = await apiClient.get<PainelResponse>('/hstvei/painel');
  return data;
}

export async function fetchStats(): Promise<HstVeiStats> {
  const { data } = await apiClient.get<HstVeiStats>('/hstvei/stats');
  return data;
}

export async function fetchSituacoes(): Promise<Situacao[]> {
  const { data } = await apiClient.get<Situacao[]>('/hstvei/situacoes');
  return data;
}

export async function fetchPrioridades(): Promise<Prioridade[]> {
  const { data } = await apiClient.get<Prioridade[]>('/hstvei/prioridades');
  return data;
}

export async function fetchById(id: number): Promise<HstVeiEnriched> {
  const { data } = await apiClient.get<HstVeiEnriched>(`/hstvei/${id}`);
  return data;
}

export async function fetchAtivasPorVeiculo(codveiculo: number): Promise<HstVeiEnriched[]> {
  const { data } = await apiClient.get<HstVeiEnriched[]>(`/hstvei/veiculo/${codveiculo}`);
  return data;
}

export async function fetchHistorico(codveiculo: number, page = 1, limit = 50): Promise<HistoricoResponse> {
  const { data } = await apiClient.get<HistoricoResponse>(
    `/hstvei/veiculo/${codveiculo}/historico`,
    { params: { page, limit } },
  );
  return data;
}

export async function fetchCadeiaNotas(id: number): Promise<CadeiaNotaItem[]> {
  const { data } = await apiClient.get<CadeiaNotaItem[]>(`/hstvei/${id}/cadeia-notas`);
  return data;
}

export async function fetchItensNota(id: number): Promise<ItemNota[]> {
  const { data } = await apiClient.get<ItemNota[]>(`/hstvei/${id}/itens-nota`);
  return data;
}

export interface ListHstVeiParams {
  page?: number;
  limit?: number;
  codveiculo?: number;
  idsit?: number;
  idpri?: number;
  coddep?: number;
  ativas?: 'true' | 'false';
  busca?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface ListHstVeiResponse {
  data: HstVeiEnriched[];
  meta: { page: number; limit: number; totalRegistros: number };
}

export interface OperadorAtribuicao {
  hstveiId: number;
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  veiculoCapacidade: string | null;
  veiculoFabricante: string | null;
  situacao: string;
  departamento: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  idpri: number | null;
  prioridadeSigla: string | null;
  descricao: string | null;
  nuos: number | null;
  numos: number | null;
  nomeParc: string | null;
}

export interface OperadorResumo {
  codusu: number;
  nome: string;
  codparc: number | null;
  tipo: 'operador' | 'mecanico';
  atribuicoes: OperadorAtribuicao[];
}

export async function fetchHstVeiList(params: ListHstVeiParams): Promise<ListHstVeiResponse> {
  const { data } = await apiClient.get<ListHstVeiResponse>('/hstvei', { params });
  return data;
}

export async function fetchOperadores(): Promise<OperadorResumo[]> {
  const { data } = await apiClient.get<OperadorResumo[]>('/hstvei/operadores');
  return data;
}

export async function criarSituacao(payload: CriarSituacaoPayload & { codUsuInc?: number }) {
  console.log('[api/hstvei] POST /hstvei payload:', payload);
  const { data } = await apiClient.post('/hstvei', payload);
  console.log('[api/hstvei] POST /hstvei response:', data);
  return data;
}

export async function atualizarSituacao(id: number, payload: AtualizarSituacaoPayload & { codUsuAlt?: number }) {
  const { data } = await apiClient.put(`/hstvei/${id}`, payload);
  return data;
}

export async function encerrarSituacao(id: number, codUsuAlt?: number) {
  const { data } = await apiClient.patch(`/hstvei/${id}/encerrar`, { codUsuAlt });
  return data;
}

export async function trocarSituacao(id: number, payload: TrocarSituacaoPayload & { codUsuAlt?: number }) {
  const { data } = await apiClient.patch(`/hstvei/${id}/trocar-situacao`, payload);
  return data;
}
