export interface OsListItem {
  NUOS: number;
  DTABERTURA: string;
  DATAFIN: string | null;
  STATUS: string;
  TIPO: string;
  MANUTENCAO: string;
  CODVEICULO: number | null;
  PREVISAO: string | null;
  CODEMP: number;
  marcaModelo: string | null;
  placa: string | null;
  tagVeiculo: string | null;
  nomeUsuAbertura: string;
  statusLabel: string;
  manutencaoLabel: string;
  tipoLabel: string;
  qtdServicos: number;
}

export interface OsResumo {
  totalOs: number;
  abertas: number;
  emExecucao: number;
  fechadas: number;
  canceladas: number;
  veiculosAtendidos: number;
}

export interface OsColabServico {
  NUOS: number;
  DTABERTURA: string;
  STATUS: string;
  statusLabel: string;
  TIPO: string | null;
  tipoLabel: string | null;
  MANUTENCAO: string | null;
  manutencaoLabel: string | null;
  localManutencao: string | null;
  localManutencaoLabel: string | null;
  marcaModelo: string | null;
  placa: string | null;
  sequencia: number;
  nomeServico: string | null;
  dtInicio: string | null;
  dtFim: string | null;
  tempoGastoMin: number;
  nomeExecutor: string | null;
  codparcExec: number | null;
  codrdoVinculado: number | null;
}

export interface OsListParams {
  dataInicio?: string;
  dataFim?: string;
  codveiculo?: string;
  codusuexec?: string;
  codparcexec?: string;
  status?: string;
  tipo?: string;
  manutencao?: string;
  page?: number;
  limit?: number;
}

export interface OsListResponse {
  data: OsListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OsColabParams {
  codusu?: string;
  codparc?: string;
  dataInicio?: string;
  dataFim?: string;
}
