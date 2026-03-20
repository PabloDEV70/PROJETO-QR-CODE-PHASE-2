export interface OsColabServico {
  NUOS: number;
  DTABERTURA: string;
  STATUS: string;
  statusLabel: string;
  TIPO: string | null;
  tipoLabel: string | null;
  MANUTENCAO: string | null;
  manutencaoLabel: string | null;
  marcaModelo: string | null;
  placa: string | null;
  sequencia: number;
  nomeServico: string | null;
  dtInicio: string | null;
  dtFim: string | null;
  tempoGastoMin: number;
  nomeExecutor: string | null;
  codparcExec: number | null;
}

export interface OsListItem {
  NUOS: number;
  DTABERTURA: string;
  STATUS: string;
  statusLabel: string;
  TIPO: string;
  tipoLabel: string;
  MANUTENCAO: string;
  manutencaoLabel: string;
  CODVEICULO: number | null;
  marcaModelo: string | null;
  placa: string | null;
  tagVeiculo: string | null;
  PREVISAO: string | null;
  CODEMP: number;
  nomeUsuAbertura: string;
  qtdServicos: number;
}

export interface OsListResponse {
  data: OsListItem[];
  meta: { total: number; page: number; limit: number };
}

export interface OsServiceItem {
  NUOS: number;
  SEQUENCIA: number;
  CODPROD: number;
  nomeProduto: string | null;
  QTD: number;
  VLRUNIT: number;
  VLRTOT: number;
  DATAINI: string | null;
  DATAFIN: string | null;
  TEMPO: number | null;
  STATUS: string;
  OBSERVACAO: string | null;
  statusLabel: string | null;
}
