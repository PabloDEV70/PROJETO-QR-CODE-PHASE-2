import { apiClient } from '@/api/client';

export interface Veiculo {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  categoria: string;
  tipo: string;
  fabricante: string;
  capacidade: string;
  anofabric: number | null;
  anomod: number | null;
  chassis: string | null;
  renavam: string | null;
  combustivel: string | null;
  kmacum: number | null;
  ativo: string;
  bloqueado: string;
  codmotorista: number | null;
  tag: string | null;
  exibeDash: string;
}

export interface VeiculosListResponse {
  data: Veiculo[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListVeiculosParams {
  page?: number;
  limit?: number;
  ativo?: string;
  categoria?: string;
  searchTerm?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export async function listarVeiculos(
  params: ListVeiculosParams = {},
): Promise<Veiculo[]> {
  const response = await apiClient.get<Veiculo[] | VeiculosListResponse>('/veiculos', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      ativo: params.ativo,
      categoria: params.categoria,
      searchTerm: params.searchTerm,
      orderBy: params.orderBy,
      orderDir: params.orderDir,
    },
  });
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.data ?? [];
}

export async function buscarVeiculoPorPlaca(placa: string): Promise<Veiculo | null> {
  const response = await apiClient.get<Veiculo[]>('/veiculos/search', {
    params: { q: placa },
  });
  return response.data[0] ?? null;
}

export async function getVeiculoById(codveiculo: number): Promise<Veiculo> {
  const { data } = await apiClient.get<Veiculo>(`/veiculos/${codveiculo}`);
  return data;
}
