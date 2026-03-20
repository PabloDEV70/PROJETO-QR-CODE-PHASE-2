import { apiClient } from '@/api/client';
import type {
  OsEnrichedResponse,
  OsObservacaoResponse,
} from '@/types/os-detail-types';

export async function getOsEnriched(
  nuos: number,
): Promise<OsEnrichedResponse> {
  const { data } = await apiClient.get<OsEnrichedResponse>(`/os/${nuos}`);
  return data;
}

export async function getOsObservacao(
  nuos: number,
): Promise<OsObservacaoResponse> {
  const { data } = await apiClient.get<OsObservacaoResponse>(
    `/os/${nuos}/observacao`,
  );
  return data;
}
