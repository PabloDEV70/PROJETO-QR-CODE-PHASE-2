import { apiClient } from './client';
import type {
  ProdutoComSeries,
  SerieAtual,
  SerieHistorico,
} from '@/types/series-types';
import type {
  ColaboradorComMateriais,
  MaterialEmpenhado,
} from '@/types/empenhados-types';

export async function getProdutosComSeries(): Promise<ProdutoComSeries[]> {
  const { data } = await apiClient.get<ProdutoComSeries[]>('/series/produtos');
  return data;
}

export async function getSeriesPorProduto(
  codProd: number,
): Promise<SerieAtual[]> {
  const { data } = await apiClient.get<SerieAtual[]>(
    `/series/${codProd}`,
  );
  return data;
}

export async function getHistoricoSerie(
  codProd: number,
  serie: string,
): Promise<SerieHistorico[]> {
  const { data } = await apiClient.get<SerieHistorico[]>(
    `/series/${codProd}/${encodeURIComponent(serie)}`,
  );
  return data;
}

export async function buscarSerie(
  q: string,
): Promise<SerieAtual[]> {
  const { data } = await apiClient.get<SerieAtual[]>(
    '/series/buscar',
    { params: { q } },
  );
  return data;
}

export async function getColaboradoresComMateriais(): Promise<ColaboradorComMateriais[]> {
  const { data } = await apiClient.get<ColaboradorComMateriais[]>('/series/empenhados');
  return data;
}

export async function getMateriaisDoUsuario(
  codusu: number,
): Promise<MaterialEmpenhado[]> {
  const { data } = await apiClient.get<MaterialEmpenhado[]>(
    `/series/empenhados/usuario/${codusu}`,
  );
  return data;
}

export async function getMateriaisDoParceiro(
  codparc: number,
): Promise<MaterialEmpenhado[]> {
  const { data } = await apiClient.get<MaterialEmpenhado[]>(
    `/series/empenhados/parceiro/${codparc}`,
  );
  return data;
}
