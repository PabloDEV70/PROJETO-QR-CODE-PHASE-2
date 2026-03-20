/** Category key — dynamic from DB WTCATEGORIA column */
export type WrenchTimeCategory = string;

export type BenchmarkStatus = 'below' | 'target' | 'above';

export interface WrenchTimeCategoryDef {
  key: string;
  label: string;
  color: string;
  description: string;
  tips: string;
}

export interface WrenchTimeMotivoDetail {
  cod: number;
  sigla: string;
  descricao: string;
  totalMin: number;
  percentOfCategory: number;
}

export interface WrenchTimeBreakdown {
  category: string;
  label: string;
  color: string;
  totalMin: number;
  percentOfTotal: number;
  motivos: WrenchTimeMotivoDetail[];
  tips: string;
}

export interface WtDeductions {
  almocoTotalMin: number;
  almocoProgramadoMin: number;
  almocoExcessoMin: number;
  banheiroTotalMin: number;
  banheiroToleranciaMin: number;
  banheiroExcessoMin: number;
  totalRdos: number;
  totalBrutoMin: number;
  baseEfetivaMin: number;
}

export interface WrenchTimeMetrics {
  wrenchTimePercent: number;
  totalProdMin: number;
  totalLossMin: number;
  totalMin: number;
  benchmarkStatus: BenchmarkStatus;
  breakdowns: WrenchTimeBreakdown[];
  topLossCategory: string | null;
  topLossMin: number;
  deductions: WtDeductions;
}

export interface ColaboradorWrenchTime {
  codrdo: number | null;
  codparc: number;
  nomeparc: string;
  departamento: string | null;
  cargo: string;
  wrenchTimePercent: number;
  /** Backend-calculated productivity (accounts for almoco, banheiro, fumar penalties) */
  produtividadePercent: number;
  diagnostico: string;
  totalMin: number;
  prodMin: number;
  benchmarkStatus: BenchmarkStatus;
  categoryBreakdown: WrenchTimeBreakdown[];
}

export interface MotivoPorColab {
  codrdo: number;
  codparc: number;
  nomeparc: string;
  departamento: string | null;
  cargo: string;
  rdomotivocod: number;
  sigla: string;
  descricao: string;
  horasNoMotivo: number;
  /** Category from DB (AD_RDOMOTIVOS.WTCATEGORIA) */
  wtCategoria: string;
}
