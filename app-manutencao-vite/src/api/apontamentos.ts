import { apiClient } from '@/api/client';
import type {
  ApontamentoListItem,
  ApontamentoListParams,
  ApontamentoFormData,
  ServicoApontamento,
  ServicoFormData,
} from '@/types/apontamento-types';

interface MutationResult {
  foiSucesso?: boolean;
  sucesso?: boolean;
  registrosAfetados: number;
  mensagem: string;
}

export async function getApontamentos(
  params: ApontamentoListParams = {},
): Promise<{ data: ApontamentoListItem[]; total: number }> {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.orderBy) query.orderBy = params.orderBy;
  if (params.orderDir) query.orderDir = params.orderDir;
  if (params.dtInicio) query.dtInicio = params.dtInicio;
  if (params.dtFim) query.dtFim = params.dtFim;
  if (params.codveiculo) query.codveiculo = params.codveiculo;
  if (params.statusOs) query.statusOs = params.statusOs;

  const { data } = await apiClient.get<{
    data: ApontamentoListItem[];
    meta: { total: number };
  }>('/apontamentos/listar', { params: query });
  return { data: data.data ?? [], total: data.meta?.total ?? 0 };
}

export async function getApontamentoServicos(
  codigo: number,
): Promise<ServicoApontamento[]> {
  const { data } = await apiClient.get<ServicoApontamento[]>(
    `/apontamentos/${codigo}`,
  );
  return Array.isArray(data) ? data : [];
}

export async function createApontamento(
  formData: ApontamentoFormData,
): Promise<MutationResult> {
  const body = mapFormToPayload(formData);
  const res = await apiClient.post<MutationResult>('/apontamentos', body);
  return res.data;
}

export async function updateApontamento(
  codigo: number,
  formData: ApontamentoFormData,
): Promise<MutationResult> {
  const body = mapFormToPayload(formData);
  const res = await apiClient.put<MutationResult>(
    `/apontamentos/${codigo}`,
    body,
  );
  return res.data;
}

export async function deleteApontamento(
  codigo: number,
): Promise<MutationResult> {
  const res = await apiClient.delete<MutationResult>(
    `/apontamentos/${codigo}`,
  );
  return res.data;
}

export async function addServico(
  codigo: number,
  formData: ServicoFormData,
): Promise<MutationResult> {
  const body = mapServicoToPayload(formData);
  const res = await apiClient.post<MutationResult>(
    `/apontamentos/${codigo}/servicos`,
    body,
  );
  return res.data;
}

export async function updateServico(
  codigo: number,
  seq: number,
  formData: ServicoFormData,
): Promise<MutationResult> {
  const body = mapServicoToPayload(formData);
  const res = await apiClient.put<MutationResult>(
    `/apontamentos/${codigo}/servicos/${seq}`,
    body,
  );
  return res.data;
}

export async function deleteServico(
  codigo: number,
  seq: number,
): Promise<MutationResult> {
  const res = await apiClient.delete<MutationResult>(
    `/apontamentos/${codigo}/servicos/${seq}`,
  );
  return res.data;
}

function mapFormToPayload(f: ApontamentoFormData) {
  return {
    CODVEICULO: f.codveiculo,
    KM: f.km,
    HORIMETRO: f.horimetro,
    TAG: f.tag || null,
    OBS: f.obs || null,
    BORRCHARIA: f.borrcharia ? 'S' : 'N',
    ELETRICA: f.eletrica ? 'S' : 'N',
    FUNILARIA: f.funilaria ? 'S' : 'N',
    MECANICA: f.mecanica ? 'S' : 'N',
    CALDEIRARIA: f.caldeiraria ? 'S' : 'N',
    OSEXTERNA: f.osExterna ? 'S' : 'N',
    OPEXTERNO: f.opExterno || null,
    DTPROGRAMACAO: f.dtProgramacao || null,
  };
}

function mapServicoToPayload(f: ServicoFormData) {
  return {
    DESCRITIVO: f.descritivo || null,
    CODPROD: f.codprod,
    QTD: f.qtd,
    GERAOS: f.geraOs ? 'S' : 'N',
    HR: f.hr,
    KM: f.km,
    DTPROGRAMACAO: f.dtProgramacao || null,
  };
}
