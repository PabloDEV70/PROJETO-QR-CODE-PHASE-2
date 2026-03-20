export interface VehicleKpiRow {
  codveiculo: number;
  placa: string;
  marca: string | null;
  tag: string | null;
  tipo: string | null;
  totalOS: number;
  mttrHoras: number | null;
  mtbfDias: number | null;
}

export interface VehicleOsItem {
  nuos: number;
  dtabertura: string;
  datafin: string | null;
  status: string;
  statusLabel: string;
  manutencao: string;
  manutencaoLabel: string;
  horimetro: number | null;
  km: number | null;
  nomeParc: string | null;
  totalServicos: number;
}

export interface VehicleDetailResponse {
  codveiculo: number;
  placa: string;
  marca: string | null;
  tag: string | null;
  tipo: string | null;
  kpis: {
    totalOS: number;
    mttrHoras: number | null;
    mtbfDias: number | null;
    availability: number | null;
  };
  osHistory: VehicleOsItem[];
}
