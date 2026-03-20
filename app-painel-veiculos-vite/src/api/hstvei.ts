import { apiClient } from '@/api/client';
import type { PainelResponse, HstVeiStats, PainelVeiculo } from '@/types/hstvei-types';

export async function fetchPainel(): Promise<PainelResponse> {
  const { data } = await apiClient.get<PainelResponse>('/hstvei/painel');
  return data;
}

export async function fetchStats(): Promise<HstVeiStats> {
  const { data } = await apiClient.get<HstVeiStats>('/hstvei/stats');
  return data;
}

export async function fetchProximos(): Promise<PainelVeiculo[]> {
  const { data } = await apiClient.get<PainelVeiculo[]>('/hstvei/proximos');
  return data;
}
