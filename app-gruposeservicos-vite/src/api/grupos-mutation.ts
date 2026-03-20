import { apiClient } from '@/api/client';
import type {
  ArvoreGrupo,
  CreateGrupoInput,
  UpdateGrupoInput,
  CreateServicoInput,
  UpdateServicoInput,
  MoveServicoInput,
  ToggleAtivoInput,
} from '@/types/grupo-types';

export const getNextCodGrupo = async (codGrupoPai?: number): Promise<{ sugestao: number; filhos: number[] }> => {
  const params = codGrupoPai ? { codGrupoPai } : {};
  const { data } = await apiClient.get('/servicos-grupo/next-cod', { params });
  return data;
};

export const getArvoreTodos = async (): Promise<ArvoreGrupo[]> => {
  const { data } = await apiClient.get<ArvoreGrupo[]>('/servicos-grupo/arvore-todos');
  return data;
};

export const createGrupo = async (input: CreateGrupoInput) => {
  const { data } = await apiClient.post('/servicos-grupo/grupos', input);
  return data;
};

export const updateGrupo = async (codGrupo: number, input: UpdateGrupoInput) => {
  const { data } = await apiClient.put(`/servicos-grupo/grupos/${codGrupo}`, input);
  return data;
};

export const toggleGrupoAtivo = async (codGrupo: number, input: ToggleAtivoInput) => {
  const { data } = await apiClient.put(`/servicos-grupo/grupos/${codGrupo}/ativo`, input);
  return data;
};

export const createServico = async (input: CreateServicoInput) => {
  const { data } = await apiClient.post('/servicos-grupo/servicos', input);
  return data;
};

export const updateServico = async (codProd: number, input: UpdateServicoInput) => {
  const { data } = await apiClient.put(`/servicos-grupo/servicos/${codProd}`, input);
  return data;
};

export const moveServico = async (codProd: number, input: MoveServicoInput) => {
  const { data } = await apiClient.put(`/servicos-grupo/servicos/${codProd}/mover`, input);
  return data;
};

export const toggleServicoAtivo = async (codProd: number, input: ToggleAtivoInput) => {
  const { data } = await apiClient.put(`/servicos-grupo/servicos/${codProd}/ativo`, input);
  return data;
};
