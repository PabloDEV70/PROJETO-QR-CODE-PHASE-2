import { apiClient } from '@/api/client';
import type {
  RdoMotivo,
  RdoFormData,
  DetalheFormData,
  RdoListResponse,
  RdoListParams,
  RdoCabecalho,
  RdoDetalheItem,
  RdoMetricas,
} from '@/types/rdo-types';

export async function getMeusRdos(
  params: RdoListParams = {},
): Promise<RdoListResponse> {
  const { data } = await apiClient.get<RdoListResponse>('/rdo', { params });
  return data;
}

export async function getRdoById(codrdo: number): Promise<RdoCabecalho> {
  const { data } = await apiClient.get<RdoCabecalho>(`/rdo/${codrdo}`);
  return data;
}

export async function getRdoMetricas(codrdo: number): Promise<RdoMetricas> {
  const { data } = await apiClient.get<RdoMetricas>(`/rdo/${codrdo}/metricas`);
  return data;
}

export async function getRdoDetalhes(
  codrdo: number,
): Promise<RdoDetalheItem[]> {
  const { data } = await apiClient.get<RdoDetalheItem[]>(
    `/rdo/${codrdo}/detalhes`,
  );
  return data;
}

export async function getMotivosAtivos(): Promise<RdoMotivo[]> {
  const { data } = await apiClient.get<{ data: RdoMotivo[] }>('/motivos', { params: { ativo: 'S' } });
  return data.data ?? data;
}

// --- RDO Mutations ---

export async function createRdo(data: RdoFormData): Promise<{ CODRDO?: number }> {
  const { data: result } = await apiClient.post('/rdo', data);
  return result;
}

export async function updateRdo(codrdo: number, data: Partial<RdoFormData>): Promise<void> {
  await apiClient.put(`/rdo/${codrdo}`, data);
}

export async function deleteRdo(codrdo: number): Promise<void> {
  await apiClient.delete(`/rdo/${codrdo}`);
}

export async function addDetalhe(codrdo: number, data: DetalheFormData): Promise<unknown> {
  const { data: result } = await apiClient.post(`/rdo/${codrdo}/detalhes`, data);
  return result;
}

export async function updateDetalhe(codrdo: number, item: number, data: Partial<DetalheFormData>): Promise<void> {
  await apiClient.put(`/rdo/${codrdo}/detalhes/${item}`, data);
}

export async function deleteDetalhe(codrdo: number, item: number): Promise<void> {
  await apiClient.delete(`/rdo/${codrdo}/detalhes/${item}`);
}
