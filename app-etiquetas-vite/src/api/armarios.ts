import { apiClient } from '@/api/client';
import type {
  ArmarioListItem,
  ArmarioListResponse,
  ArmarioLocal,
  ListarArmariosParams,
} from '@/types/armario-types';

export async function getArmarios(
  params: ListarArmariosParams,
): Promise<ArmarioListResponse> {
  const query: Record<string, string> = {};
  if (params.page) query.page = String(params.page);
  if (params.limit) query.limit = String(params.limit);
  if (params.localArm) query.localArm = String(params.localArm);
  if (params.ocupado !== undefined) query.ocupado = String(params.ocupado);
  if (params.departamento) query.departamento = params.departamento;
  if (params.termo) query.termo = params.termo;
  if (params.orderBy) query.orderBy = params.orderBy;
  if (params.orderDir) query.orderDir = params.orderDir;

  const { data } = await apiClient.get<ArmarioListResponse>('/armarios', {
    params: query,
  });
  return data;
}

export async function getArmariosTodos(
  params: Omit<ListarArmariosParams, 'page' | 'limit'>,
): Promise<ArmarioListItem[]> {
  const query: Record<string, string> = {};
  if (params.localArm) query.localArm = String(params.localArm);
  if (params.ocupado !== undefined) query.ocupado = String(params.ocupado);
  if (params.departamento) query.departamento = params.departamento;
  if (params.termo) query.termo = params.termo;
  if (params.orderBy) query.orderBy = params.orderBy;
  if (params.orderDir) query.orderDir = params.orderDir;

  const { data } = await apiClient.get<{ data: ArmarioListItem[] }>(
    '/armarios/todos',
    { params: query },
  );
  return data.data;
}

export async function getArmarioLocais(): Promise<ArmarioLocal[]> {
  const { data } = await apiClient.get<ArmarioLocal[]>('/armarios/locais');
  return data;
}
