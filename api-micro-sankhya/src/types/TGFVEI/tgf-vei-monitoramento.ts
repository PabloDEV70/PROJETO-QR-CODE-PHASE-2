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

export type TipoAlerta = 'ATRASADA' | 'BLOQUEIO' | 'MULTIPLAS_OS' | 'PREVENTIVA_PROXIMA';

export interface OsAtivaResumo {
  nuos: number;
  tipo: string;
  tipoLabel: string;
  dtAbertura: string;
  previsao: string | null;
  parceiro: string | null;
}

export interface AlertaVeiculo {
  tipo: TipoAlerta;
  mensagem: string;
  diasAtraso?: number;
}

export interface AtividadeVeiculo {
  tipo: string;
  descricao: string;
  data: string;
}

export interface MetricasVeiculo {
  totalOsAno: number;
  corretivasAno: number;
  preventivasAno: number;
  kmAtual: number | null;
}

export interface VeiculoMonitoramento {
  codveiculo: number;
  placa: string;
  marcaModelo: string;
  categoria: string;
  tag: string | null;
  status: VeiculoStatus;
  statusLabel: string;
  statusSince: string | null;
  osAtiva: OsAtivaResumo | null;
  alertas: AlertaVeiculo[];
  ultimaAtividade: AtividadeVeiculo | null;
  metricas: MetricasVeiculo;
}

export interface MonitoramentoFilters {
  status?: VeiculoStatus;
  comAlerta?: boolean;
  categoria?: string;
}

export interface MonitoramentoStats {
  total: number;
  porStatus: Record<VeiculoStatus, number>;
  comAlerta: number;
}

export interface VeiculoMonitoramentoRow {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  categoria: string;
  tag: string | null;
  kmacum: number | null;
  status: VeiculoStatus;
  osNuos: number | null;
  osTipo: string | null;
  osDtAbertura: string | null;
  osPrevisao: string | null;
  osParceiro: string | null;
  osDataIni: string | null;
  totalOsAno: number;
  corretivasAno: number;
  preventivasAno: number;
  ultimaOsFinalizada: string | null;
  alertaTipo: string | null;
  alertaMensagem: string | null;
  alertaDias: number | null;
}
