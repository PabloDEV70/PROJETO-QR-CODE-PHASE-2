import { apiClient } from '@/api/client';
import type {
  Corrida,
  CorridaResumo,
  Motorista,
  ListCorridasParams,
  TempoTransitoStats,
  RankingItem,
  VolumeMensal,
  DistribuicaoTipo,
  DistribuicaoHoraria,
  CreateCorridaPayload,
  UpdateCorridaPayload,
  MutationResult,
  UserRole,
  Localizacao,
  MinhasCorridasParams,
  LocUser,
  ParceiroBusca,
} from '@/types/corrida';

export async function getCorridasList(params: ListCorridasParams = {}): Promise<{ data: Corrida[]; total: number }> {
  const { data } = await apiClient.get<{ data: Corrida[]; total: number }>('/corridas', { params });
  return data;
}

export async function getCorridaById(id: number): Promise<Corrida> {
  const { data } = await apiClient.get<Corrida>(`/corridas/${id}`);
  return data;
}

export async function getCorridasResumo(): Promise<CorridaResumo> {
  const { data } = await apiClient.get<CorridaResumo>('/corridas/resumo');
  return data;
}

export async function getMotoristas(): Promise<Motorista[]> {
  const { data } = await apiClient.get<Motorista[]>('/corridas/motoristas');
  return data;
}

export async function getStatsTempoTransito(params?: { dataInicio?: string; dataFim?: string }): Promise<TempoTransitoStats> {
  const { data } = await apiClient.get<TempoTransitoStats>('/corridas/stats/tempo-transito', { params });
  return data;
}

export async function getStatsPorMotorista(params?: { dataInicio?: string; dataFim?: string }): Promise<RankingItem[]> {
  const { data } = await apiClient.get<RankingItem[]>('/corridas/stats/por-motorista', { params });
  return data;
}

export async function getStatsPorSolicitante(params?: { dataInicio?: string; dataFim?: string }): Promise<RankingItem[]> {
  const { data } = await apiClient.get<RankingItem[]>('/corridas/stats/por-solicitante', { params });
  return data;
}

export async function getStatsPorParceiro(params?: { dataInicio?: string; dataFim?: string }): Promise<RankingItem[]> {
  const { data } = await apiClient.get<RankingItem[]>('/corridas/stats/por-parceiro', { params });
  return data;
}

export async function getStatsVolumeMensal(): Promise<VolumeMensal[]> {
  const { data } = await apiClient.get<VolumeMensal[]>('/corridas/stats/volume-mensal');
  return data;
}

export async function getStatsPorTipo(params?: { dataInicio?: string; dataFim?: string }): Promise<DistribuicaoTipo[]> {
  const { data } = await apiClient.get<DistribuicaoTipo[]>('/corridas/stats/por-tipo', { params });
  return data;
}

export async function getStatsPorHora(params?: { dataInicio?: string; dataFim?: string }): Promise<DistribuicaoHoraria[]> {
  const { data } = await apiClient.get<DistribuicaoHoraria[]>('/corridas/stats/por-hora', { params });
  return data;
}

export async function createCorrida(payload: CreateCorridaPayload): Promise<MutationResult> {
  const { data } = await apiClient.post<MutationResult>('/corridas', payload);
  return data;
}

export async function updateCorrida(id: number, payload: UpdateCorridaPayload): Promise<MutationResult> {
  const { data } = await apiClient.put<MutationResult>(`/corridas/${id}`, payload);
  return data;
}

export async function updateCorridaStatus(id: number, status: string, codUsu?: number): Promise<MutationResult> {
  const { data } = await apiClient.patch<MutationResult>(`/corridas/${id}/status`, { status, codUsu });
  return data;
}

export async function assignMotorista(id: number, codUsu: number): Promise<MutationResult> {
  const { data } = await apiClient.patch<MutationResult>(`/corridas/${id}/motorista`, { codUsu });
  return data;
}

export async function getMyRole(): Promise<UserRole> {
  const { data } = await apiClient.get<UserRole>('/corridas/me/role');
  return data;
}

export async function getMinhasCorridas(params: MinhasCorridasParams = {}): Promise<Corrida[]> {
  const { data } = await apiClient.get<Corrida[]>('/corridas/minhas', { params });
  return data;
}

export async function enviarLocalizacao(
  id: number,
  latitude: number,
  longitude: number,
  accuracy?: number,
): Promise<{ ok: boolean }> {
  const { data } = await apiClient.patch<{ ok: boolean }>(`/corridas/${id}/localizacao`, {
    latitude,
    longitude,
    accuracy,
  });
  return data;
}

export async function getLocalizacao(id: number): Promise<Localizacao> {
  const { data } = await apiClient.get<Localizacao>(`/corridas/${id}/localizacao`);
  return data;
}

export async function enviarMinhaLocalizacao(
  latitude: number,
  longitude: number,
  accuracy?: number,
): Promise<{ ok: boolean }> {
  const { data } = await apiClient.patch<{ ok: boolean }>('/corridas/minha-localizacao', {
    latitude,
    longitude,
    accuracy,
  });
  return data;
}

export async function getLocalizacoesAtivas(): Promise<LocUser[]> {
  const { data } = await apiClient.get<LocUser[]>('/corridas/localizacoes-ativas');
  return data;
}

export async function buscarParceiros(search: string): Promise<ParceiroBusca[]> {
  const { data } = await apiClient.get<ParceiroBusca[]>('/corridas/parceiros-busca', {
    params: { search },
  });
  return data;
}
