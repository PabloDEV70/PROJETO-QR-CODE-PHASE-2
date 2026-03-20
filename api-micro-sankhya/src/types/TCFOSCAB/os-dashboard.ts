export interface OsPorStatus {
  status: string | null;
  statusLabel: string | null;
  total: number;
}

export interface OsPorTipoManutencao {
  manutencao: string | null;
  manutencaoLabel: string | null;
  total: number;
}

export interface OsRecente {
  NUOS: number;
  DTABERTURA: Date | null;
  STATUS: string | null;
  statusLabel: string | null;
  MANUTENCAO: string | null;
  manutencaoLabel: string | null;
  CODVEICULO: number | null;
  placa: string | null;
  marcaModelo: string | null;
}

export interface OsDashboard {
  porStatus: OsPorStatus[];
  porTipoManutencao: OsPorTipoManutencao[];
  recentes: OsRecente[];
  paraExibir: OsRecente[];
}
