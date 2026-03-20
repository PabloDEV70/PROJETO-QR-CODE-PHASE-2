import { apiClient } from '@/api/client';
import type { ArvoreGrupo, ServicoGrupo, ServicoItem } from '@/types/grupo-types';

export const getArvoreCompleta = async (): Promise<ArvoreGrupo[]> => {
  const { data } = await apiClient.get<ArvoreGrupo[]>('/servicos-grupo/arvore');
  return data;
};

export const getGrupos = async (): Promise<ServicoGrupo[]> => {
  const { data } = await apiClient.get<ServicoGrupo[]>('/servicos-grupo/grupos');
  return data;
};

export const getServicosPorGrupo = async (codGrupo: number): Promise<ServicoItem[]> => {
  const { data } = await apiClient.get<ServicoItem[]>(
    `/servicos-grupo/grupos/${codGrupo}/servicos`,
  );
  return data;
};
