export interface OsListItem {
  NUOS: number;
  STATUS: string;
  MANUTENCAO: string | null;
  TIPO: string | null;
  DTABERTURA: string | null;
  DATAINI: string | null;
  DATAFIN: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  CODVEICULO: number | null;
  CODPARC: number | null;
  CODMOTORISTA: number | null;
  NUPLANO: number | null;
  AD_STATUSGIG: string | null;
  AD_BLOQUEIOS: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_OSORIGEM: number | null;
  AD_FINALIZACAO: string | null;
  CODEMP: number | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  AD_TAG: string | null;
  statusLabel: string;
  manutencaoLabel: string;
  tipoLabel: string;
  TOTAL_SERVICOS: number;
  CUSTO_TOTAL: number;
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

export interface OsListOptions {
  dataInicio?: string;
  dataFim?: string;
  codveiculo?: string;
  codusuexec?: string;
  codparcexec?: string;
  status?: string;
  tipo?: string;
  manutencao?: string;
  statusGig?: string;
  search?: string;
  page?: number;
  limit?: number;
}
