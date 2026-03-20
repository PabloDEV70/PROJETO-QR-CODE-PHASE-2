import { apiClient } from '@/api/client';
import type {
  Chamado,
  ChamadoResumo,
  ChamadoOcorrencia,
  ChamadoAnexo,
  KanbanColumn,
  SetorResumo,
  ChamadosListParams,
  MutationResult,
  UpdateChamadoPayload,
  UpdateStatusPayload,
  CreateChamadoPayload,
  AddOcorrenciaPayload,
  ChamadoUsuario,
  ChatListItem,
  ChatListParams,
} from '@/types/chamados-types';

export async function getChamadosList(params: ChamadosListParams = {}): Promise<Chamado[]> {
  const { data } = await apiClient.get<{ data: Chamado[]; total: number }>('/chamados', { params });
  return data.data;
}

export async function getChamadosResumo(): Promise<ChamadoResumo> {
  const { data } = await apiClient.get<ChamadoResumo>('/chamados/resumo');
  return data;
}

export async function getChamadosKanban(): Promise<KanbanColumn[]> {
  const { data } = await apiClient.get<KanbanColumn[]>('/chamados/kanban');
  return data;
}

export async function getChamadosPorSetor(): Promise<SetorResumo[]> {
  const { data } = await apiClient.get<SetorResumo[]>('/chamados/por-setor');
  return data;
}

export async function getChamadoById(nuchamado: number): Promise<Chamado> {
  const { data } = await apiClient.get<Chamado>(`/chamados/${nuchamado}`);
  return data;
}

export async function getChamadoOcorrencias(nuchamado: number): Promise<ChamadoOcorrencia[]> {
  const { data } = await apiClient.get<ChamadoOcorrencia[]>(
    `/chamados/${nuchamado}/ocorrencias`,
  );
  return data;
}

export async function getChamadoAnexos(nuchamado: number): Promise<ChamadoAnexo[]> {
  const { data } = await apiClient.get<ChamadoAnexo[]>(
    `/chamados/${nuchamado}/anexos`,
  );
  return data;
}

// --- Mutations ---

export async function updateChamado(
  nuchamado: number,
  payload: UpdateChamadoPayload,
): Promise<MutationResult> {
  const { data } = await apiClient.put<MutationResult>(`/chamados/${nuchamado}`, payload);
  return data;
}

export async function createChamado(
  payload: CreateChamadoPayload,
): Promise<MutationResult> {
  const { data } = await apiClient.post<MutationResult>('/chamados', payload);
  return data;
}

export async function addOcorrencia(
  nuchamado: number,
  payload: AddOcorrenciaPayload,
): Promise<MutationResult> {
  const { data } = await apiClient.post<MutationResult>(
    `/chamados/${nuchamado}/ocorrencias`,
    payload,
  );
  return data;
}

export async function getChamadosUsuarios(): Promise<ChamadoUsuario[]> {
  const { data } = await apiClient.get<ChamadoUsuario[]>('/chamados/usuarios');
  return data;
}

export async function getChatList(params: ChatListParams = {}): Promise<ChatListItem[]> {
  const { data } = await apiClient.get<ChatListItem[]>('/chamados/chat-list', { params });
  return data;
}

export async function deleteOcorrencia(
  nuchamado: number,
  sequencia: number,
): Promise<MutationResult> {
  const { data } = await apiClient.delete<MutationResult>(
    `/chamados/${nuchamado}/ocorrencias/${sequencia}`,
  );
  return data;
}

export async function updateChamadoStatus(
  nuchamado: number,
  payload: UpdateStatusPayload,
): Promise<MutationResult> {
  const { data } = await apiClient.patch<MutationResult>(
    `/chamados/${nuchamado}/status`,
    payload,
  );
  return data;
}
