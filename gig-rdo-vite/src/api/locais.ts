import { apiClient } from './client';
import type {
  ArvoreLocal,
  EstoqueLocal,
  ProdutoDetalhes,
  VeiculoProduto,
} from '@/types/local-produto';

export async function getLocaisArvore(): Promise<ArvoreLocal[]> {
  const { data } = await apiClient.get<ArvoreLocal[]>('/locais/arvore');
  return data;
}

export async function getEstoquePorLocal(
  codLocal: number,
): Promise<EstoqueLocal[]> {
  const { data } = await apiClient.get<EstoqueLocal[]>(
    `/locais/${codLocal}/estoque`,
  );
  return data;
}

export async function getProdutoDetalhes(
  codProd: number,
): Promise<ProdutoDetalhes> {
  const { data } = await apiClient.get<ProdutoDetalhes>(
    `/produtos/${codProd}/detalhes`,
  );
  return data;
}

export async function getVeiculosPorProduto(
  codProd: number,
): Promise<VeiculoProduto[]> {
  const { data } = await apiClient.get<VeiculoProduto[]>(
    `/produtos/${codProd}/veiculos`,
  );
  return data;
}
