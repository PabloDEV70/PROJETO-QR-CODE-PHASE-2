import { apiClient, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';
import type { PerfilEnriquecido } from '@/types/perfil-types';
import type { OsListItem, OsListResponse, OsServiceItem } from '@/types/os-types';

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/${codparc}/foto?token=${token}`;
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/foto/${codemp}/${codfunc}?token=${token}`;
}

export async function getPerfilEnriquecido(codparc: number): Promise<PerfilEnriquecido> {
  const { data } = await apiClient.get<PerfilEnriquecido>(
    `/funcionarios/${codparc}/perfil-enriquecido`,
  );
  return data;
}

export async function getOsAbertasExecutor(codparc: number): Promise<OsListItem[]> {
  const { data } = await apiClient.get<OsListResponse>('/os/list', {
    params: { codparcexec: codparc, status: 'A', limit: 50 },
  });
  return data.data ?? [];
}

export async function getOsEmExecucao(codparc: number): Promise<OsListItem[]> {
  const { data } = await apiClient.get<OsListResponse>('/os/list', {
    params: { codparcexec: codparc, status: 'E', limit: 50 },
  });
  return data.data ?? [];
}

export async function getOsServicos(nuos: number): Promise<OsServiceItem[]> {
  const { data } = await apiClient.get<OsServiceItem[]>(`/os/${nuos}/servicos`);
  return Array.isArray(data) ? data : [];
}
