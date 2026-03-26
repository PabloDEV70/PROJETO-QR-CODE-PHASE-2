import { apiClient } from '@/api/client';
import type { OrdemServico, ServicoOs, OsResumo, OsListParams, OsDetailEnriched } from '@/types/os-types';

export interface OsListResponse {
  data: OrdemServico[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getOsList(params: OsListParams = {}): Promise<OsListResponse> {
  const { data } = await apiClient.get<OsListResponse>('/os/list', { params });
  return data;
}

export async function getOsResumo(params: OsListParams = {}): Promise<OsResumo> {
  const { data } = await apiClient.get<OsResumo>('/os/resumo', { params });
  return data;
}

export async function getOsById(nuos: number): Promise<OsDetailEnriched> {
  const { data } = await apiClient.get<OsDetailEnriched>(`/os/${nuos}`);
  return data;
}

export async function getOsServicos(nuos: number): Promise<ServicoOs[]> {
  const { data } = await apiClient.get<ServicoOs[]>(`/os-manutencao/${nuos}/servicos`);
  return data;
}

export async function getOsDashboard(): Promise<Record<string, unknown>> {
  const { data } = await apiClient.get('/os/dashboard');
  return data;
}

export async function getOsAtivas(): Promise<OrdemServico[]> {
  const { data } = await apiClient.get<OrdemServico[]>('/os/ativas');
  return data;
}

export async function searchOs(q: string): Promise<OrdemServico[]> {
  const { data } = await apiClient.get<OrdemServico[]>('/os-manutencao/search', { params: { q } });
  return data;
}

// --- MUTATIONS ---

interface MutationResult {
  foiSucesso?: boolean;
  sucesso?: boolean;
  registrosAfetados: number;
  mensagem: string;
}

export interface OsCreateData {
  CODVEICULO: number;
  MANUTENCAO: string;
  TIPO: string;
  CODPARC?: number;
  CODMOTORISTA?: number;
  PREVISAO?: string;
  KM?: number;
  HORIMETRO?: number;
  NUPLANO?: number;
  AD_STATUSGIG?: string;
  CODEMP?: number;
}

export interface OsUpdateData {
  CODVEICULO?: number;
  CODPARC?: number;
  CODMOTORISTA?: number;
  CODEMP?: number;
  MANUTENCAO?: string;
  TIPO?: string;
  PREVISAO?: string;
  KM?: number;
  HORIMETRO?: number;
  NUPLANO?: number;
  AD_STATUSGIG?: string;
  AD_LOCALMANUTENCAO?: string;
  AD_BLOQUEIOS?: string;
}

export interface ServicoCreateData {
  CODPROD: number;
  QTD?: number;
  VLRUNIT?: number;
  VLRTOT?: number;
  TEMPO?: number;
  OBSERVACAO?: string;
}

export async function createOs(data: OsCreateData): Promise<MutationResult> {
  const res = await apiClient.post<MutationResult>('/os-manutencao', data);
  return res.data;
}

export async function updateOs(nuos: number, data: OsUpdateData): Promise<MutationResult> {
  const res = await apiClient.put<MutationResult>(`/os-manutencao/${nuos}`, data);
  return res.data;
}

export async function changeOsStatus(nuos: number, status: string, statusGig?: string): Promise<MutationResult> {
  const res = await apiClient.patch<MutationResult>(`/os-manutencao/${nuos}/status`, { status, statusGig });
  return res.data;
}

export async function finalizeOs(nuos: number): Promise<MutationResult> {
  const res = await apiClient.patch<MutationResult>(`/os-manutencao/${nuos}/finalizar`);
  return res.data;
}

export async function cancelOs(nuos: number): Promise<MutationResult> {
  const res = await apiClient.patch<MutationResult>(`/os-manutencao/${nuos}/cancelar`);
  return res.data;
}

export async function reopenOs(nuos: number): Promise<MutationResult> {
  const res = await apiClient.patch<MutationResult>(`/os-manutencao/${nuos}/reabrir`);
  return res.data;
}

export async function addServico(nuos: number, data: ServicoCreateData): Promise<MutationResult> {
  const res = await apiClient.post<MutationResult>(`/os-manutencao/${nuos}/servicos`, data);
  return res.data;
}

export async function updateServico(nuos: number, sequencia: number, data: Partial<ServicoCreateData>): Promise<MutationResult> {
  const res = await apiClient.put<MutationResult>(`/os-manutencao/${nuos}/servicos/${sequencia}`, data);
  return res.data;
}

export async function deleteServico(nuos: number, sequencia: number): Promise<MutationResult> {
  const res = await apiClient.delete<MutationResult>(`/os-manutencao/${nuos}/servicos/${sequencia}`);
  return res.data;
}

// --- M3: Compras vinculadas ---
export interface OsCompraResponse {
  notas: OsComprasNota[];
  itens: OsComprasItem[];
}
export interface OsComprasNota {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  TIPMOV: string | null;
  STATUSNOTA: string;
  VLRNOTA: number | null;
  NUMCOTACAO: number | null;
  DTNEG: string | null;
  NOME_USUARIO: string | null;
}
export interface OsComprasItem {
  NUNOTA: number;
  SEQUENCIA: number;
  CODPROD: number;
  PRODUTO_DESCRICAO: string;
  QTDNEG: number;
  QTDENTREGUE: number | null;
  QTD_PENDENTE: number;
  PENDENTE: string | null;
  STATUS_COTACAO: string | null;
  NUMPEDIDO: number | null;
  VLRUNIT: number | null;
  VLRTOT: number | null;
  UNIDADE: string | null;
}

export async function getOsCompras(nuos: number): Promise<OsCompraResponse> {
  const { data } = await apiClient.get<OsCompraResponse>(`/os/${nuos}/compras`);
  return data;
}

// --- M4: Timeline ---
export interface OsTimelineEntry {
  SEQUENCIA: number;
  NUOS: number;
  DHALTER: string;
  CODUSU: number | null;
  NOME_USUARIO: string | null;
  AD_STATUSGIG: string | null;
  AD_FINALIZACAO: string | null;
}

export async function getOsTimeline(nuos: number): Promise<OsTimelineEntry[]> {
  const { data } = await apiClient.get<OsTimelineEntry[]>(`/os/${nuos}/timeline`);
  return data;
}
