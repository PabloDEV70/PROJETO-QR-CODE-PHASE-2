import { apiClient } from './client';
import type { SankhyaUser, UserPermission, TDPER, GrupoUsuario, SankhyaAccessResource } from '@/types/permission-types';

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
  const { data } = await apiClient.get<PaginatedResponse<SankhyaUser>>('/sankhya/usuarios', { params });
  return data;
}

export async function getUsuario(codUsu: number): Promise<SankhyaUser> {
  const { data } = await apiClient.get<SankhyaUser>(`/sankhya/usuarios/${codUsu}`);
  return data;
}

export async function getUsuarioPermissoes(codUsu: number): Promise<UserPermission[]> {
  const { data } = await apiClient.get<UserPermission[]>(`/sankhya/usuarios/${codUsu}/permissoes`);
  return data;
}

export async function listRecursos(params?: {
  term?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<SankhyaAccessResource>> {
  const { data } = await apiClient.get<PaginatedResponse<SankhyaAccessResource>>('/sankhya/recursos', { params });
  return data;
}

export async function getRecursosPorPrefixo(prefixo: string): Promise<SankhyaAccessResource[]> {
  const { data } = await apiClient.get<SankhyaAccessResource[]>(`/sankhya/recursos/por-prefixo`, {
    params: { prefixo },
  });
  return data;
}

export interface ComparePermissoesParams {
  usuarioA: number;
  usuarioB: number;
}

export interface ComparePermissoesResponse {
  usuarioA: SankhyaUser;
  usuarioB: SankhyaUser;
  onlyInA: UserPermission[];
  onlyInB: UserPermission[];
  common: UserPermission[];
}

export async function comparePermissoes(params: ComparePermissoesParams): Promise<ComparePermissoesResponse> {
  const { data } = await apiClient.post<ComparePermissoesResponse>('/sankhya/permissoes/comparar', params);
  return data;
}

export async function copiarPermissao(permissoes: TDPER[]): Promise<void> {
  await apiClient.post('/sankhya/permissoes/copiar', { permissoes });
}

export async function adicionarPermissao(permissao: TDPER): Promise<TDPER> {
  const { data } = await apiClient.post<TDPER>('/sankhya/permissoes', permissao);
  return data;
}

export async function removerPermissao(codUsu: number, idAcesso: string, codGrupo: number): Promise<void> {
  await apiClient.delete(`/sankhya/permissoes/${codUsu}/${idAcesso}`, {
    params: { codGrupo },
  });
}

export async function listGruposUsuario(codUsu: number): Promise<GrupoUsuario[]> {
  const { data } = await apiClient.get<GrupoUsuario[]>(`/sankhya/usuarios/${codUsu}/grupos`);
  return data;
}

export async function getUsuariosPorGrupo(codGrupo: number): Promise<SankhyaUser[]> {
  const { data } = await apiClient.get<SankhyaUser[]>(`/sankhya/grupos/${codGrupo}/usuarios`);
  return data;
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
  const { data } = await apiClient.post<InvestigarDocumentoResponse>('/sankhya/documentos/investigar', params);
  return data;
}
