export interface OsEnrichedHeader {
  NUOS: number;
  DTABERTURA: string;
  DATAFIN: string | null;
  DATAINI: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  STATUS: string;
  TIPO: string | null;
  MANUTENCAO: string | null;
  CODVEICULO: number | null;
  HORIMETRO: number | null;
  KM: number | null;
  CODEMP: number | null;
  NUPLANO: number | null;
  AD_STATUSGIG: string | null;
  AD_FINALIZACAO: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_BLOQUEIOS: string | null;
  AD_OSORIGEM: number | null;
  CODPARC: number | null;
  CODMOTORISTA: number | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  tipoLabel: string | null;
  localLabel: string | null;
  finalizacaoLabel: string | null;
  totalServicos: number;
  custoTotal: number;
  veiculoMarca: string | null;
  veiculoPlaca: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  nomeUsuInc: string | null;
  nomeUsuAlter: string | null;
  nomeUsuFin: string | null;
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

export interface OsExecutorItem {
  NUOS: number;
  SEQUENCIA: number;
  codusu: number | null;
  nomeUsuario: string | null;
  nomeColaborador: string | null;
  dtIni: string | null;
  dtFin: string | null;
  minutos: number | null;
  obs: string | null;
}

export interface OsVeiculo {
  marca: string | null;
  placa: string | null;
  tag: string | null;
  tipo: string | null;
}

export interface OsEnrichedResponse {
  NUOS: number;
  DTABERTURA: string;
  DATAFIN: string | null;
  DATAINI: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  STATUS: string;
  TIPO: string | null;
  MANUTENCAO: string | null;
  CODVEICULO: number | null;
  HORIMETRO: number | null;
  KM: number | null;
  CODEMP: number | null;
  NUPLANO: number | null;
  AD_STATUSGIG: string | null;
  AD_FINALIZACAO: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_BLOQUEIOS: string | null;
  AD_OSORIGEM: number | null;
  CODPARC: number | null;
  CODMOTORISTA: number | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  tipoLabel: string | null;
  localLabel: string | null;
  finalizacaoLabel: string | null;
  totalServicos: number;
  custoTotal: number;
  nomeUsuInc: string | null;
  nomeUsuAlter: string | null;
  nomeUsuFin: string | null;
  veiculo: OsVeiculo;
  servicos: OsServiceItem[];
  executores: OsExecutorItem[];
}
