import { apiClient } from '@/api/client';
import type {
  PatrimonioDashboard,
  PatrimonioBemListItem,
  PatrimonioBemDetalhe,
  PatrimonioMobilizacaoItem,
  PatrimonioLocalizacaoItem,
  PatrimonioDocumentoItem,
  PatrimonioOsHistoricoItem,
  PatrimonioDepreciacaoBem,
  PatrimonioComissionamentoItem,
  PatrimonioMobilizacaoCliente,
  PatrimonioMobilizacaoVeiculo,
  PatrimonioDepreciacaoConsolidada,
  PatrimonioCategoriaResumo,
  PatrimonioListFilters,
} from '@/types/patrimonio-types';

export async function fetchPatrimonioDashboard(): Promise<PatrimonioDashboard> {
  const { data } = await apiClient.get<PatrimonioDashboard>('/patrimonio/dashboard');
  return data;
}

export async function fetchPatrimonioBens(
  filters?: PatrimonioListFilters,
): Promise<PatrimonioBemListItem[]> {
  const params: Record<string, string> = {};
  if (filters?.search) params.search = filters.search;
  if (filters?.categoria) params.categoria = filters.categoria;
  if (filters?.status && filters.status !== 'todos') params.status = filters.status;
  if (filters?.mobilizado && filters.mobilizado !== 'todos') params.mobilizado = filters.mobilizado;
  if (filters?.temPatrimonio && filters.temPatrimonio !== 'todos') {
    params.temPatrimonio = filters.temPatrimonio;
  }
  if (filters?.empresa) params.empresa = String(filters.empresa);
  const { data } = await apiClient.get<PatrimonioBemListItem[]>('/patrimonio/bens', { params });
  return data;
}

export async function fetchPatrimonioBemDetalhe(
  codbem: string,
  codprod?: number,
): Promise<PatrimonioBemDetalhe> {
  const params = codprod ? { codprod } : {};
  const { data } = await apiClient.get<PatrimonioBemDetalhe>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}`,
    { params },
  );
  return data;
}

export async function fetchPatrimonioBemMobilizacao(
  codbem: string,
): Promise<PatrimonioMobilizacaoItem[]> {
  const { data } = await apiClient.get<PatrimonioMobilizacaoItem[]>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/mobilizacao`,
  );
  return data;
}

export async function fetchPatrimonioBemLocalizacao(
  codbem: string,
): Promise<PatrimonioLocalizacaoItem[]> {
  const { data } = await apiClient.get<PatrimonioLocalizacaoItem[]>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/localizacao`,
  );
  return data;
}

export async function fetchPatrimonioBemDocumentos(
  codbem: string,
): Promise<PatrimonioDocumentoItem[]> {
  const { data } = await apiClient.get<PatrimonioDocumentoItem[]>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/documentos`,
  );
  return data;
}

export async function fetchPatrimonioBemOs(
  codbem: string,
): Promise<PatrimonioOsHistoricoItem[]> {
  const { data } = await apiClient.get<PatrimonioOsHistoricoItem[]>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/os`,
  );
  return data;
}

export async function fetchPatrimonioBemDepreciacao(
  codbem: string,
  codprod?: number,
): Promise<PatrimonioDepreciacaoBem> {
  const params = codprod ? { codprod } : {};
  const { data } = await apiClient.get<PatrimonioDepreciacaoBem>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/depreciacao`,
    { params },
  );
  return data;
}

export async function fetchPatrimonioBemComissionamento(
  codbem: string,
): Promise<PatrimonioComissionamentoItem[]> {
  const { data } = await apiClient.get<PatrimonioComissionamentoItem[]>(
    `/patrimonio/bens/${encodeURIComponent(codbem)}/comissionamento`,
  );
  return data;
}

export async function fetchPatrimonioMobilizacao(): Promise<PatrimonioMobilizacaoCliente[]> {
  const { data } = await apiClient.get<PatrimonioMobilizacaoCliente[]>(
    '/patrimonio/mobilizacao',
  );
  return data;
}

export async function fetchPatrimonioMobilizacaoVeiculos(): Promise<
  PatrimonioMobilizacaoVeiculo[]
> {
  const { data } = await apiClient.get<PatrimonioMobilizacaoVeiculo[]>(
    '/patrimonio/mobilizacao/veiculos',
  );
  return data;
}

export async function fetchPatrimonioDepreciacao(): Promise<PatrimonioDepreciacaoConsolidada[]> {
  const { data } = await apiClient.get<PatrimonioDepreciacaoConsolidada[]>(
    '/patrimonio/depreciacao',
  );
  return data;
}

export async function fetchPatrimonioCategorias(): Promise<PatrimonioCategoriaResumo[]> {
  const { data } = await apiClient.get<PatrimonioCategoriaResumo[]>(
    '/patrimonio/categorias',
  );
  return data;
}
