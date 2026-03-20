/**
 * Produtividade de um técnico
 */
export interface ProdutividadeTecnico {
  codusu: number;
  nomeUsuario: string | null;
  totalOs: number;
  totalServicos: number;
  mediaMinutosServico: number | null;
  totalMinutos: number | null;
}

/**
 * Ranking de técnicos por produtividade
 */
export interface RankingProdutividade {
  tecnicos: ProdutividadeTecnico[];
  totalTecnicos: number;
  totalServicosExecutados: number;
}
