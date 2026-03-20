export type PreventiveStatusType = 'EM_DIA' | 'ATRASADA' | 'SEM_HISTORICO';

export interface PreventivaQuadroItem {
  codigo: string;
  status: PreventiveStatusType;
  ultimaData: string | null;
  diasParaVencer: number | null;
  proximaData: string | null;
}

export interface VeiculoQuadro {
  codveiculo: number;
  placa: string;
  marcaModelo: string;
  tipoEquipamento: string | null;
  tag: string | null;
  preventivas: PreventivaQuadroItem[];
  resumo: { total: number; emDia: number; atrasadas: number; semHistorico: number };
}

export interface QuadroResumoGeral {
  totalVeiculos: number;
  emDia: number;
  atrasados: number;
  semHistorico: number;
}

export interface QuadroResponse {
  data: VeiculoQuadro[];
  categorias: string[];
  resumoGeral: QuadroResumoGeral;
}
