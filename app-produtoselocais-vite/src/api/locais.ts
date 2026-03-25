import { apiClient } from './client';
import type {
  ArvoreLocal, EstoqueItem, ProdutoBusca, ProdutoDetalhes,
  ProdutoEstoque, GrupoProduto, VeiculoProduto,
} from '@/types/locais-types';

// ── Locais ──

export async function fetchArvoreLocais(): Promise<ArvoreLocal[]> {
  const { data } = await apiClient.get<ArvoreLocal[]>('/locais/arvore');
  return data;
}

export async function fetchEstoquePorLocal(codLocal: number): Promise<EstoqueItem[]> {
  const { data } = await apiClient.get<EstoqueItem[]>(`/locais/${codLocal}/estoque`);
  return data;
}

// ── Produtos ──

export interface BuscarProdutosParams {
  q?: string;
  grupo?: string;
  usoprod?: 'S' | 'P';
  limit?: number;
}

export async function fetchProdutosBusca(params: BuscarProdutosParams): Promise<ProdutoBusca[]> {
  const { data } = await apiClient.get<ProdutoBusca[]>('/produtos/buscar', { params });
  return data;
}

export async function fetchProdutoDetalhes(codProd: number): Promise<ProdutoDetalhes> {
  const { data } = await apiClient.get<ProdutoDetalhes>(`/produtos/${codProd}/detalhes`);
  return data;
}

export async function fetchProdutoFull(codProd: number): Promise<ProdutoDetalhes & { estoqueTotal?: number; estoqueReservado?: number; qtdLocais?: number }> {
  const { data } = await apiClient.get(`/produtos/${codProd}/full`);
  return data;
}

export async function fetchProdutoEstoque(codProd: number): Promise<ProdutoEstoque[]> {
  const { data } = await apiClient.get<ProdutoEstoque[]>(`/produtos/${codProd}/estoque`);
  return data;
}

export async function fetchProdutoVeiculos(codProd: number): Promise<VeiculoProduto[]> {
  const { data } = await apiClient.get<VeiculoProduto[]>(`/produtos/${codProd}/veiculos`);
  return data;
}

export async function fetchGruposProduto(): Promise<GrupoProduto[]> {
  const { data } = await apiClient.get<GrupoProduto[]>('/produtos/grupos');
  return data;
}

export function getProdutoImagemUrl(codProd: number): string {
  const baseUrl = apiClient.defaults.baseURL || '';
  return `${baseUrl}/produtos/${codProd}/imagem`;
}
