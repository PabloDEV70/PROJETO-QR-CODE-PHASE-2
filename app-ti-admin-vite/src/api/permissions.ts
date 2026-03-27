import { apiClient } from './client';
import type {
  SankhyaUser,
  PermissaoTela,
  UsuarioDetalhes,
  UsuarioPermDireta,
} from '@/types/permission-types';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export async function listUsuarios(params?: {
  term?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<SankhyaUser>> {
  const apiParams: Record<string, unknown> = {};
  if (params?.page != null) apiParams.page = params.page + 1;
  if (params?.limit) apiParams.limit = params.limit;

  if (params?.term) {
    apiParams.q = params.term;
    const { data } = await apiClient.get('/usuarios/search', { params: apiParams });
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return { data: arr, meta: { total: arr.length, page: params?.page ?? 0, limit: params?.limit ?? 25 } };
  }

  const { data } = await apiClient.get('/usuarios', { params: apiParams });
  if (Array.isArray(data)) {
    return { data, meta: { total: data.length, page: params?.page ?? 0, limit: params?.limit ?? 25 } };
  }
  if (data?.data) return data;
  return { data: [], meta: { total: 0, page: 0, limit: 25 } };
}

export async function getUsuario(codUsu: number): Promise<SankhyaUser> {
  const { data } = await apiClient.get(`/usuarios/${codUsu}`);
  return data;
}

export async function getUsuarioDetalhes(codUsu: number): Promise<UsuarioDetalhes | null> {
  const { data } = await apiClient.get(`/permissoes/usuarios/${codUsu}`);
  return data;
}

export async function listRecursos(params?: {
  term?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<PermissaoTela>> {
  const apiParams: Record<string, unknown> = {};
  if (params?.page != null) apiParams.page = params.page + 1;
  if (params?.limit) apiParams.limit = params.limit;
  if (params?.term) apiParams.termo = params.term;

  const { data } = await apiClient.get('/permissoes/telas', { params: apiParams });

  if (data?.data) return data;
  if (Array.isArray(data)) {
    return { data, meta: { total: data.length, page: params?.page ?? 0, limit: params?.limit ?? 25 } };
  }
  return { data: [], meta: { total: 0, page: 0, limit: 25 } };
}

export async function getRecursosPorPrefixo(prefixo: string): Promise<PermissaoTela[]> {
  const { data } = await apiClient.get('/permissoes/telas', {
    params: { termo: prefixo, limit: 500 },
  });
  return data?.data ?? (Array.isArray(data) ? data : []);
}

export interface ComparePermissoesParams {
  usuarioA: number;
  usuarioB: number;
}

export interface ComparePermissoesResponse {
  usuarioA: { codUsu: number; nomeUsu: string };
  usuarioB: { codUsu: number; nomeUsu: string };
  onlyInA: UsuarioPermDireta[];
  onlyInB: UsuarioPermDireta[];
  common: UsuarioPermDireta[];
}

export async function comparePermissoes(params: ComparePermissoesParams): Promise<ComparePermissoesResponse> {
  const [detailA, detailB] = await Promise.all([
    getUsuarioDetalhes(params.usuarioA),
    getUsuarioDetalhes(params.usuarioB),
  ]);

  const allA = [...(detailA?.diretas ?? []), ...(detailA?.herdadas ?? [])];
  const allB = [...(detailB?.diretas ?? []), ...(detailB?.herdadas ?? [])];

  const setA = new Set(allA.map((p) => p.idAcesso));
  const setB = new Set(allB.map((p) => p.idAcesso));

  return {
    usuarioA: { codUsu: detailA?.codUsu ?? params.usuarioA, nomeUsu: detailA?.nomeUsu ?? '' },
    usuarioB: { codUsu: detailB?.codUsu ?? params.usuarioB, nomeUsu: detailB?.nomeUsu ?? '' },
    onlyInA: allA.filter((p) => !setB.has(p.idAcesso)),
    onlyInB: allB.filter((p) => !setA.has(p.idAcesso)),
    common: allA.filter((p) => setB.has(p.idAcesso)),
  };
}

export interface InvestigarDocumentoParams {
  nunota?: number;
  numnota?: number;
  codparc?: number;
}

export interface InvestigarDocumentoResponse {
  cab?: Record<string, unknown>;
  itens?: Record<string, unknown>[];
  historico?: Record<string, unknown>[];
  excluido?: boolean;
  tabelaOriginal?: string;
}

export async function investigarDocumento(params: InvestigarDocumentoParams): Promise<InvestigarDocumentoResponse> {
  const { data } = await apiClient.get('/nota-detalhe', { params });
  return data;
}
