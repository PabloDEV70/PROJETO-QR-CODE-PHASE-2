export interface OsCompleta {
  NUOS: number;
  NUPLANO: number | null;
  MANUTENCAO: string | null;
  TIPO: string | null;
  CODVEICULO: number | null;
  CODPARC: number | null;
  STATUS: string | null;
  AD_STATUSGIG: string | null;
  AD_BLOQUEIOS: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_FINALIZACAO: string | null;
  DTABERTURA: string | null;
  DATAINI: string | null;
  DATAFIN: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  HORIMETRO: number | null;
  KM: number | null;
  CODEMP: number | null;
  placa: string | null;
  marcaModelo: string | null;
  tagVeiculo: string | null;
  nomeParc: string | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  totalServicos: number;
}

export interface OsServico {
  NUOS: number;
  SEQUENCIA: number;
  CODPROD: number | null;
  nomeProduto: string | null;
  QTD: number | null;
  VLRUNIT: number | null;
  VLRTOT: number | null;
  DATAINI: string | null;
  DATAFIN: string | null;
  TEMPO: number | null;
  STATUS: string | null;
  OBSERVACAO: string | null;
  statusLabel: string | null;
}
