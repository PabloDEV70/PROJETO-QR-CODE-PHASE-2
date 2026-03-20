import { apiClient } from './client';
import type { RdoMotivo, RdoDetalheItem, DetalheFormData } from '@/types/rdo-types';
import type { OsListItem, OsServiceItem } from '@/types/os-types';

export async function fetchMotivos(): Promise<RdoMotivo[]> {
  const { data } = await apiClient.get('/motivos', { params: { ativo: 'S' } });
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function fetchRdoDia(codparc: number, dtref: string) {
  const { data } = await apiClient.get('/rdo', {
    params: { codparc, dataInicio: dtref, dataFim: dtref, limit: 1 },
  });
  return data;
}

export async function createRdo(codparc: number, dtref: string) {
  const { data } = await apiClient.post('/rdo', { CODPARC: codparc, DTREF: dtref });
  return data;
}

export async function fetchDetalhes(codrdo: number): Promise<RdoDetalheItem[]> {
  const { data } = await apiClient.get(`/rdo/${codrdo}/detalhes`);
  return data;
}

export async function fetchMetricas(codrdo: number) {
  const { data } = await apiClient.get(`/rdo/${codrdo}/metricas`);
  return data;
}

export async function addDetalhe(codrdo: number, form: DetalheFormData) {
  const { data } = await apiClient.post(`/rdo/${codrdo}/detalhes`, form);
  return data;
}

export async function updateDetalhe(
  codrdo: number,
  item: number,
  form: Partial<DetalheFormData>,
) {
  const { data } = await apiClient.put(`/rdo/${codrdo}/detalhes/${item}`, form);
  return data;
}

export async function deleteDetalhe(codrdo: number, item: number) {
  const { data } = await apiClient.delete(`/rdo/${codrdo}/detalhes/${item}`);
  return data;
}

export async function fetchOsAbertas(codparc: number): Promise<OsListItem[]> {
  // API aceita status unico — buscar E (execucao) primeiro, depois A (aberta)
  const [execRes, abertaRes] = await Promise.allSettled([
    apiClient.get('/os/list', { params: { codparcexec: codparc, status: 'E', limit: 30 } }),
    apiClient.get('/os/list', { params: { codparcexec: codparc, status: 'A', limit: 30 } }),
  ]);
  const exec = execRes.status === 'fulfilled' ? (execRes.value.data?.data ?? []) : [];
  const aberta = abertaRes.status === 'fulfilled' ? (abertaRes.value.data?.data ?? []) : [];
  return [...exec, ...aberta];
}

export async function fetchOsServicos(nuos: number): Promise<OsServiceItem[]> {
  const { data } = await apiClient.get(`/os/${nuos}/servicos`);
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function fetchQuemFaz(dtref: string) {
  const { data } = await apiClient.get('/rdo/quem-faz', { params: { data: dtref } });
  return data;
}

export async function startOsServico(nuos: number, sequencia: number, codparc: number) {
  const { data } = await apiClient.post(
    `/os-manutencao/${nuos}/servicos/${sequencia}/start`,
    { codparc },
  );
  return data;
}

export async function finishOsServico(nuos: number, sequencia: number, codparc: number) {
  const { data } = await apiClient.post(
    `/os-manutencao/${nuos}/servicos/${sequencia}/finish`,
    { codparc },
  );
  return data;
}
