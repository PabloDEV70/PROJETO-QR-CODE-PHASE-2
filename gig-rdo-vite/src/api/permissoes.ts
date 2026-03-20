import { apiClient } from '@/api/client';
import type {
  PermissoesResumo,
  TelaListResponse,
  TelaListParams,
  TelaDetalhes,
  GrupoListItem,
  GrupoDetalhes,
  UsuarioListResponse,
  UsuarioListParams,
  UsuarioDetalhes,
  ConflitoItem,
} from '@/types/permissoes-types';

export async function getPermissoesResumo(): Promise<PermissoesResumo> {
  const { data } = await apiClient.get<PermissoesResumo>('/permissoes/resumo');
  return data;
}

export async function getPermissoesTelas(
  params: TelaListParams = {},
): Promise<TelaListResponse> {
  const { data } = await apiClient.get<TelaListResponse>('/permissoes/telas', { params });
  return data;
}

export async function getPermissoesTelaDetalhes(
  idacesso: string,
): Promise<TelaDetalhes> {
  const { data } = await apiClient.get<TelaDetalhes>(
    `/permissoes/telas/${encodeURIComponent(idacesso)}`,
  );
  return data;
}

export async function getPermissoesGrupos(): Promise<GrupoListItem[]> {
  const { data } = await apiClient.get<GrupoListItem[]>('/permissoes/grupos');
  return data;
}

export async function getPermissoesGrupoDetalhes(
  codgrupo: number,
): Promise<GrupoDetalhes> {
  const { data } = await apiClient.get<GrupoDetalhes>(`/permissoes/grupos/${codgrupo}`);
  return data;
}

export async function getPermissoesUsuarios(
  params: UsuarioListParams = {},
): Promise<UsuarioListResponse> {
  const { data } = await apiClient.get<UsuarioListResponse>(
    '/permissoes/usuarios',
    { params },
  );
  return data;
}

export async function getPermissoesUsuarioDetalhes(
  codusu: number,
): Promise<UsuarioDetalhes> {
  const { data } = await apiClient.get<UsuarioDetalhes>(`/permissoes/usuarios/${codusu}`);
  return data;
}

export async function getPermissoesConflitos(): Promise<ConflitoItem[]> {
  const { data } = await apiClient.get<ConflitoItem[]>('/permissoes/conflitos');
  return data;
}
