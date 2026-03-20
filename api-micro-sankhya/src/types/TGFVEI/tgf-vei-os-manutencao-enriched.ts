export interface OsManutencaoEnriched {
  NUOS: number;
  STATUS: string;
  STATUS_DESCRICAO: string;
  TIPO: string;
  MANUTENCAO: string;
  MANUTENCAO_DESCRICAO: string;
  DATAINI: string | null;
  PREVISAO: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  QTD_SERVICOS: number;
  SERVICOS_EM_EXEC: number;
  SERVICOS_FINALIZADOS: number;
  SERVICO_PRINCIPAL: string | null;
  AD_STATUSGIG: string;
  AD_STATUSGIG_DESCRICAO: string;
  AD_BLOQUEIOS: string;
  AD_BLOQUEIOS_DESCRICAO: string;
}
