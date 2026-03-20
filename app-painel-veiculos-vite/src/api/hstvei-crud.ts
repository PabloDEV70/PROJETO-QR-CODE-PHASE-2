import { apiClient, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

/** Converts {} empty objects from API to null */
function sanitize<T>(val: T): T | null {
  if (val !== null && typeof val === 'object' && !Array.isArray(val) && Object.keys(val as object).length === 0) return null;
  return val;
}

/** Sanitize all string/number fields in a row (API returns {} for nulls) */
export function sanitizeRow<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row };
  for (const key of Object.keys(out)) {
    out[key as keyof T] = sanitize(out[key as keyof T]) as T[keyof T];
  }
  return out;
}

// Matches HstVeiEnriched from backend
export interface HstVeiRow {
  ID: number;
  CODVEICULO: number;
  IDSIT: number;
  IDPRI: number | null;
  DESCRICAO: string | null;
  OBS: string | null;
  DTINICIO: string;
  DTPREVISAO: string | null;
  DTFIM: string | null;
  NUNOTA: number | null;
  NUOS: number | null;
  NUMOS: number | null;
  CODPARC: number | null;
  EXEOPE: string | null;
  EXEMEC: string | null;
  CODUSUINC: number;
  CODUSUALT: number;
  DTCRIACAO: string;
  DTALTER: string;
  // enriched
  placa: string | null;
  marcaModelo: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  veiculoCapacidade: string | null;
  veiculoFabricante: string | null;
  situacaoDescricao: string;
  situacaoCoddep: number;
  departamentoNome: string | null;
  prioridadeSigla: string | null;
  prioridadeDescricao: string | null;
  nomeParc: string | null;
  nomeUsuInc: string | null;
  nomeUsuAlt: string | null;
  osStatus: string | null;
  osTipo: string | null;
  osManutencao: string | null;
  osDtAbertura: string | null;
  mosCliente: string | null;
  mosSituacao: string | null;
  mosContrato: number | null;
  mosAtendente: string | null;
  mosDtPrevista: string | null;
}

export interface HstVeiListResponse {
  data: HstVeiRow[];
  meta: { totalRegistros: number; page: number; limit: number };
}

export interface HstVeiListParams {
  page?: number;
  limit?: number;
  ativas?: 'true' | 'false';
  coddep?: number;
  idpri?: number;
  codveiculo?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface HstVeiCreatePayload {
  codveiculo: number;
  idsit: number;
  idpri?: number;
  descricao?: string;
  obs?: string;
  dtinicio?: string;
  dtprevisao?: string;
  nunota?: number;
  nuos?: number;
  numos?: number;
  codparc?: number;
  exeope?: string;
  exemec?: string;
  codUsuInc?: number;
}

export interface HstVeiUpdatePayload {
  idsit?: number;
  idpri?: number | null;
  descricao?: string | null;
  obs?: string | null;
  dtprevisao?: string | null;
  nunota?: number | null;
  nuos?: number | null;
  numos?: number | null;
  codparc?: number | null;
  exeope?: string | null;
  exemec?: string | null;
  codUsuAlt?: number;
}

// Backend Situacao type: { ID, DESCRICAO, CODDEP, OBS, departamentoNome }
export interface SituacaoOption {
  ID: number;
  DESCRICAO: string;
  CODDEP: number;
}

// Backend TsiUsuSearchResult: lowercase fields
export interface UsuarioOption {
  codusu: number;
  nomeusu: string;
  codparc: number | null;
  codemp: number | null;
  codfunc: number | null;
}

// Backend TgfPar: lowercase fields
export interface ParceiroOption {
  codparc: number;
  nomeparc: string;
  razaosocial?: string | null;
  cgc_cpf?: string | null;
  /** @deprecated use cgc_cpf */
  cgcCpf?: string | null;
}

export async function fetchHstVeiList(params: HstVeiListParams): Promise<HstVeiListResponse> {
  const { data } = await apiClient.get<HstVeiListResponse>('/hstvei', { params });
  return {
    ...data,
    data: (data.data ?? []).map((r) => sanitizeRow(r as unknown as Record<string, unknown>) as unknown as HstVeiRow),
  };
}

export async function fetchSituacoes(): Promise<SituacaoOption[]> {
  const { data } = await apiClient.get<SituacaoOption[]>('/hstvei/situacoes');
  return data;
}

export async function searchUsuarios(q: string): Promise<UsuarioOption[]> {
  const { data } = await apiClient.get<UsuarioOption[]>('/usuarios/search', { params: { q } });
  return data;
}

export async function fetchUsuarioById(codusu: number): Promise<UsuarioOption | null> {
  try {
    const { data } = await apiClient.get<UsuarioOption>(`/usuarios/${codusu}`);
    return data;
  } catch { return null; }
}

export async function fetchUsuariosByIds(ids: number[]): Promise<UsuarioOption[]> {
  const results = await Promise.all(ids.map(fetchUsuarioById));
  return results.filter((u): u is UsuarioOption => u !== null);
}

export async function searchParceiros(q: string): Promise<ParceiroOption[]> {
  const { data } = await apiClient.get<ParceiroOption[]>('/parceiros/search', { params: { q } });
  return data;
}

export async function createHstVei(payload: HstVeiCreatePayload) {
  const { data } = await apiClient.post('/hstvei', payload);
  return data;
}

export async function updateHstVei(id: number, payload: HstVeiUpdatePayload) {
  const { data } = await apiClient.put(`/hstvei/${id}`, payload);
  return data;
}

export async function encerrarHstVei(id: number) {
  const { data } = await apiClient.patch(`/hstvei/${id}/encerrar`);
  return data;
}

export function getFotoUrl(codparc: number): string {
  const base = `${getApiBaseUrl()}/funcionarios/${codparc}/foto`;
  const token = useAuthStore.getState().user?.token;
  return token ? `${base}?token=${token}` : base;
}
