export type VeiculoStatus =
  | 'LIVRE'
  | 'EM_USO'
  | 'MANUTENCAO'
  | 'AGUARDANDO_MANUTENCAO'
  | 'BLOQUEIO_COMERCIAL'
  | 'PARADO'
  | 'ALUGADO_CONTRATO'
  | 'RESERVADO_CONTRATO'
  | 'AGENDADO';

export interface VeiculoListItem {
  codveiculo: number;
  placa: string;
  marcaModelo: string;
  categoria: string;
  tag: string | null;
  status: VeiculoStatus;
  statusLabel: string;
  statusSince: string | null;
  osAtiva: {
    nuos: number;
    status: string;
    tipo: string;
    dataini: string;
  } | null;
  alertas: {
    tipo: string;
    mensagem: string;
  }[];
  ultimaAtividade: string | null;
  metricas: {
    totalOsAno: number;
    corretivasAno: number;
    preventivasAno: number;
    kmAtual: number;
  };
}

export interface VeiculoMonitoramentoStats {
  total: number;
  porStatus: Record<VeiculoStatus, number>;
  comAlerta: number;
}

export interface VeiculoListFilters {
  status?: VeiculoStatus;
  categoria?: string;
  comAlerta?: boolean;
  searchTerm?: string;
}
