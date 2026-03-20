import { apiClient } from '@/api/client';
import type {
  RdoMotivo,
  RdoMotivoFormData,
  RdoFormData,
  DetalheFormData,
  RdoListResponse,
  RdoListParams,
  RdoCabecalho,
  RdoDetalheItem,
  RdoMetricas,
  RdoStats,
  RdoResumoDiarioResponse,
  RdoSearchResult,
  MotivosListParams,
  MotivosListResponse,
  RdoDetalhesParams,
  RdoDetalhesResponse,
} from '@/types/rdo-types';
import type { ColaboradorTimelineResponse } from '@/types/rdo-timeline-types';

export async function getMeusRdos(
  params: RdoListParams = {},
): Promise<RdoListResponse> {
  const { data } = await apiClient.get<RdoListResponse>('/rdo', { params });
  return data;
}

export async function getAllRdos(
  params: RdoListParams = {},
): Promise<RdoListResponse> {
  const { data } = await apiClient.get('/rdo', { params });
  if (Array.isArray(data)) {
    return { data, meta: { total: data.length, page: params.page ?? 1, limit: params.limit ?? 50 } };
  }
  // Backend returns totalRegistros, normalize to total
  const meta = data.meta ?? {};
  return {
    data: data.data ?? data,
    meta: { total: meta.total ?? meta.totalRegistros ?? 0, page: meta.page ?? 1, limit: meta.limit ?? 50 },
  };
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

export async function getRdoStats(
  params?: { dataInicio?: string; dataFim?: string },
): Promise<RdoStats> {
  const { data } = await apiClient.get<RdoStats>('/rdo/stats', { params });
  return data;
}

export async function getRdoResumoDiario(
  params: { page?: number; limit?: number; dataInicio?: string; dataFim?: string } = {},
): Promise<RdoResumoDiarioResponse> {
  const { data } = await apiClient.get<RdoResumoDiarioResponse>(
    '/rdo/resumo-diario',
    { params },
  );
  return data;
}

export async function searchRdos(q: string): Promise<RdoSearchResult[]> {
  const { data } = await apiClient.get<RdoSearchResult[]>('/rdo/search', {
    params: { q },
  });
  return Array.isArray(data) ? data : [];
}

// --- Motivos CRUD ---

export async function getMotivos(
  params?: MotivosListParams,
): Promise<MotivosListResponse> {
  const { data } = await apiClient.get('/motivos', { params });
  // Backend may return array directly or { data, meta }
  if (Array.isArray(data)) {
    return { data, meta: { total: data.length, page: params?.page ?? 1, limit: params?.limit ?? 50 } };
  }
  return data as MotivosListResponse;
}

export async function getMotivoById(id: number): Promise<RdoMotivo> {
  const { data } = await apiClient.get<RdoMotivo>(`/motivos/${id}`);
  return data;
}

export async function searchMotivos(q: string): Promise<RdoMotivo[]> {
  const { data } = await apiClient.get<RdoMotivo[]>('/motivos/search', {
    params: { q },
  });
  return data;
}

export async function createMotivo(
  motivo: RdoMotivoFormData,
): Promise<RdoMotivo> {
  const { data } = await apiClient.post<RdoMotivo>('/motivos', motivo);
  return data;
}

export async function updateMotivo(
  id: number,
  motivo: Partial<RdoMotivoFormData>,
): Promise<RdoMotivo> {
  const { data } = await apiClient.put<RdoMotivo>(`/motivos/${id}`, motivo);
  return data;
}

export async function deleteMotivo(id: number): Promise<void> {
  await apiClient.delete(`/motivos/${id}`);
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

// --- Detalhes por periodo (cross-RDO) ---

export async function getRdoDetalhesAll(
  params: RdoDetalhesParams = {},
): Promise<RdoDetalhesResponse> {
  const { data } = await apiClient.get<RdoDetalhesResponse>('/rdo/detalhes', {
    params,
  });
  return data;
}

// --- Colaborador Timeline ---

export async function getColaboradorTimeline(
  codparc: number,
  params: { dataInicio: string; dataFim: string },
): Promise<ColaboradorTimelineResponse> {
  const { data } = await apiClient.get<ColaboradorTimelineResponse>(
    `/rdo/colaborador/${codparc}/timeline`,
    { params },
  );
  return data;
}
