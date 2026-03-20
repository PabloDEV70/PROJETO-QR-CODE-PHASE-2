import { apiClient } from './client';
import type { ArvoreGrupo, ServicoGrupo, ServicoItem } from '@/types/servico-grupo';

export async function getServicosArvore(): Promise<ArvoreGrupo[]> {
  const { data } = await apiClient.get<ArvoreGrupo[]>('/servicos-grupo/arvore');
  return data;
}

export async function getServicosGrupos(): Promise<ServicoGrupo[]> {
  const { data } = await apiClient.get<ServicoGrupo[]>('/servicos-grupo/grupos');
  return data;
}

export async function getServicosPorGrupo(
  codGrupo: number,
): Promise<ServicoItem[]> {
  const { data } = await apiClient.get<ServicoItem[]>(
    `/servicos-grupo/grupos/${codGrupo}/servicos`,
  );
  return data;
}
