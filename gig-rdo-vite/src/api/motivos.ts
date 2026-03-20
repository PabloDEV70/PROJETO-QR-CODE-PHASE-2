import { apiClient } from '@/api/client';
import type { Motivo, MotivosParams, MotivoConfigItem } from '@/types/motivos-types';

export async function getMotivos(params: MotivosParams = {}): Promise<Motivo[]> {
  const { data } = await apiClient.get<Motivo[]>('/motivos', { params });
  return data;
}

export async function searchMotivos(
  q: string,
  periodParams: { dataInicio?: string; dataFim?: string } = {},
): Promise<Motivo[]> {
  const { data } = await apiClient.get<Motivo[]>('/motivos/search', {
    params: { q, ...periodParams },
  });
  return data;
}

export async function getMotivo(id: number): Promise<Motivo> {
  const { data } = await apiClient.get<Motivo>(`/motivos/${id}`);
  return data;
}

export async function getMotivosConfig(): Promise<MotivoConfigItem[]> {
  const { data } = await apiClient.get<MotivoConfigItem[]>('/motivos/config');
  return data;
}
