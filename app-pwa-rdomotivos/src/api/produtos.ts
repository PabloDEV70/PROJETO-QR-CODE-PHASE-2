import { apiClient } from '@/api/client';
import type {
  ProdutoBusca, ProdutoFull, ProdutoEstoque, ProdutoPlaca, GrupoProduto,
} from '@/types/produto-types';

export async function buscarProdutos(params: {
  q?: string;
  grupo?: string;
  limit?: number;
}): Promise<ProdutoBusca[]> {
  const { data } = await apiClient.get<ProdutoBusca[]>('/produtos/buscar', { params });
  return data;
}

export async function getProdutoFull(codProd: number): Promise<ProdutoFull | null> {
  const { data } = await apiClient.get<ProdutoFull | null>(`/produtos/${codProd}/full`);
  return data;
}

export async function getEstoqueProduto(codProd: number): Promise<ProdutoEstoque[]> {
  const { data } = await apiClient.get<ProdutoEstoque[]>(`/produtos/${codProd}/estoque`);
  return data;
}

export async function getPlacasProduto(codProd: number): Promise<ProdutoPlaca[]> {
  const { data } = await apiClient.get<ProdutoPlaca[]>(`/produtos/${codProd}/placas`);
  return data;
}

export async function getGruposProduto(): Promise<GrupoProduto[]> {
  const { data } = await apiClient.get<GrupoProduto[]>('/produtos/grupos');
  return data;
}
