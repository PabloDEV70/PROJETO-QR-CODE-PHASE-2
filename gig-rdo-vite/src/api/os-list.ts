import { apiClient } from '@/api/client';
import type {
  OsListResponse,
  OsListParams,
  OsResumo,
  OsColabServico,
  OsColabParams,
} from '@/types/os-list-types';

export async function getOsList(
  params: OsListParams = {},
): Promise<OsListResponse> {
  const { data } = await apiClient.get<OsListResponse>('/os/list', { params });
  return data;
}

export async function getOsResumo(
  params: Omit<OsListParams, 'page' | 'limit'> = {},
): Promise<OsResumo> {
  const { data } = await apiClient.get<OsResumo>('/os/resumo', { params });
  return data;
}

export async function getOsColabServicos(
  params: OsColabParams,
): Promise<OsColabServico[]> {
  const { data } = await apiClient.get<OsColabServico[]>(
    '/os/colab-servicos',
    { params },
  );
  return data;
}
