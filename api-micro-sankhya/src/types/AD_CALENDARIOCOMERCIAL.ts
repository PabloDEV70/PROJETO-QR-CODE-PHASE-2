export interface CalendarioComercialItem {
  ID: number;
  CODVEICULO: number;
  AD_TIPOEQPTO: string;
  PLACA: string;
  MARCAMODELO: string;
  DATA: string;
  DATAFIM: string | null;
  STATUS: string | null;
  LOCAL: string | null;
  DESCR: string | null;
  CREATED: number | null;
  CREATEDDATE: string | null;
  UPDATED: number | null;
  UPDATEDDATE: string | null;
  DURACAO_DIAS: number | null;
  IS_FINALIZADO: number;
}

export interface CalendarioStats {
  TOTAL_EVENTOS: number;
  EVENTOS_ATIVOS: number;
  EVENTOS_FINALIZADOS: number;
  VEICULOS_DISTINTOS: number;
  DURACAO_MEDIA_DIAS: number | null;
}
