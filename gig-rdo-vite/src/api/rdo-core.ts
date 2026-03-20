import { apiClient } from '@/api/client';
import type {
  RdoDetalhesResponse,
  RdoDetalhesParams,
  RdoListResponse,
  RdoListParams,
  RdoListItem,
  RdoCompleto,
  RdoDetalheCompleto,
  ColaboradorTimelineResponse,
} from '@/types/rdo-types';

export async function getRdoList(
  params: RdoListParams = {},
): Promise<RdoListResponse> {
  const { data } = await apiClient.get<RdoListResponse>('/rdo', { params });
  return data;
}

export async function getRdoById(codrdo: number): Promise<RdoCompleto> {
  const { data } = await apiClient.get<RdoCompleto>(`/rdo/${codrdo}`);
  return data;
}

export async function getRdoDetalhesById(
  codrdo: number,
): Promise<RdoDetalheCompleto[]> {
  const { data } = await apiClient.get<RdoDetalheCompleto[]>(
    `/rdo/${codrdo}/detalhes`,
  );
  return data;
}

export async function getRdoDetalhes(
  params: RdoDetalhesParams = {},
): Promise<RdoDetalhesResponse> {
  const { data } = await apiClient.get<RdoDetalhesResponse>('/rdo/detalhes', {
    params,
  });
  return data;
}

export async function getRdoMetricas(codrdo: number): Promise<RdoListItem> {
  const { data } = await apiClient.get<RdoListItem>(`/rdo/${codrdo}/metricas`);
  return data;
}

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

export async function searchFuncionarios(
  query: string,
  params: Pick<RdoDetalhesParams, 'dataInicio' | 'dataFim'> = {},
): Promise<Array<{ codparc: number; nomeparc: string }>> {
  const { data } = await apiClient.get<RdoDetalhesResponse>('/rdo/detalhes', {
    params: {
      ...params,
      limit: 500,
    },
  });

  const uniqueMap = new Map<number, string>();
  for (const item of data.data) {
    if (item.CODPARC && item.nomeparc) {
      const lower = item.nomeparc.toLowerCase();
      if (lower.includes(query.toLowerCase())) {
        uniqueMap.set(item.CODPARC, item.nomeparc);
      }
    }
  }

  return Array.from(uniqueMap.entries())
    .map(([codparc, nomeparc]) => ({ codparc, nomeparc }))
    .sort((a, b) => a.nomeparc.localeCompare(b.nomeparc));
}
