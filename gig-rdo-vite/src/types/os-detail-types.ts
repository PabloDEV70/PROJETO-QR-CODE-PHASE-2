export interface OsVeiculo {
  marca: string | null;
  placa: string | null;
  tag: string | null;
  tipo: string | null;
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

export interface OsEnrichedResponse {
  NUOS: number;
  DTABERTURA: string;
  DATAFIN: string | null;
  DATAINI: string | null;
  PREVISAO: string | null;
  STATUS: string;
  TIPO: string | null;
  MANUTENCAO: string | null;
  CODVEICULO: number | null;
  HORIMETRO: number | null;
  KM: number | null;
  AD_STATUSGIG: string | null;
  AD_FINALIZACAO: string | null;
  AD_LOCALMANUTENCAO: string | null;
  CODPARC: number | null;
  nomeParc: string | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  totalServicos: number;
  veiculo: OsVeiculo;
  servicos: OsServiceItem[];
}

export interface OsObservacaoResponse {
  observacao: string | null;
}
