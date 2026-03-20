export type PreventiveStatusType = 'EM_DIA' | 'ATRASADA' | 'SEM_HISTORICO';

export type PreventiveCode = 'A1' | 'A2' | 'B1' | 'C1' | 'C2';

export interface UltimaManutencao {
  data: string | null;
  km: number | null;
  nuos: number | null;
}

export interface PreventiveStatus {
  codigo: PreventiveCode;
  descricao: string;
  tipoIntervalo: 'T' | 'K' | 'KT';
  intervaloDias: number;
  intervaloKm: number;
  tolerancia: number;
  ultimaManutencao: UltimaManutencao;
  status: PreventiveStatusType;
  diasParaVencer: number | null;
  kmParaVencer: number | null;
  proximaData: string | null;
  proximoKm: number | null;
}

export interface VeiculoPreventivasResponse {
  codveiculo: number;
  placa: string;
  tipoEquipamento: string | null;
  preventivas: PreventiveStatus[];
  resumo: {
    total: number;
    emDia: number;
    atrasadas: number;
    semHistorico: number;
  };
}

export interface PreventiveResumo {
  codveiculo: number;
  placa: string;
  tipoEquipamento: string | null;
  totalPreventivas: number;
  emDia: number;
  atrasadas: number;
  semHistorico: number;
  percentualAderencia: number;
}

export interface FrotaPreventivasResponse {
  data: PreventiveResumo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// --- Quadro de Preventivas (fleet-wide) ---

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
