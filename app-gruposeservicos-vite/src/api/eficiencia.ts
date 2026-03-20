import { apiClient } from '@/api/client';
import type {
  ServicoComExecucao,
  GrupoArvoreMan,
  PerfServicoResponse,
  PerfExecucao,
  EficienciaParams,
} from '@/types/eficiencia-types';

export const getServicosComExecucao = async (): Promise<ServicoComExecucao[]> => {
  const { data } = await apiClient.get('/man/servicos-com-execucao');
  return data;
};

export const getGruposArvore = async (): Promise<GrupoArvoreMan[]> => {
  const { data } = await apiClient.get('/man/grupos-arvore');
  return data;
};

export const getPerformanceServicoExecutor = async (params: EficienciaParams): Promise<PerfServicoResponse> => {
  const { data } = await apiClient.get('/man/performance-servico-executor', { params });
  return data;
};

export const getPerformanceServicoExecucoes = async (params: EficienciaParams): Promise<PerfExecucao[]> => {
  const { data } = await apiClient.get('/man/performance-servico-execucoes', { params });
  return data;
};
