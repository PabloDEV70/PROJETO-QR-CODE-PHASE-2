export interface OsDetalhadaCab {
  NUOS: number;
  CODVEICULO: number;
  PLACA: string;
  VEICULO: string;
  STATUS: string;
  STATUS_DESCRICAO: string;
  TIPO: string;
  TIPO_DESCRICAO: string;
  MANUTENCAO: string;
  MANUTENCAO_DESCRICAO: string;
  DATAINI: string | null;
  PREVISAO: string | null;
  DATAFIN: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  CODEMP: number | null;
  CODPARC: number | null;
  PARCEIRO_NOME: string;
  DTABERTURA: string | null;
  USUARIO_ABERTURA: string;
  AD_LOCALMANUTENCAO: string;
  AD_STATUSGIG: string;
  AD_STATUSGIG_DESCRICAO: string;
  AD_BLOQUEIOS: string;
  AD_BLOQUEIOS_DESCRICAO: string;
  TOTAL_SERVICOS: number;
  SERVICOS_EM_EXEC: number;
  SERVICOS_FINALIZADOS: number;
}

export interface OsDetalhadaServico {
  NUOS: number;
  SEQUENCIA: number;
  CODPROD: number;
  SERVICO: string;
  QTD: number | null;
  VLRUNIT: number | null;
  VLRTOT: number | null;
  STATUS: string | null;
  STATUS_DESCRICAO: string;
  DATAINI: string | null;
  DATAFIN: string | null;
  TEMPO: number | null;
  OBSERVACAO: string;
}

export interface OsDetalhadaExecucao {
  NUOS: number;
  SEQUENCIA: number;
  CODUSU: number;
  USUARIO: string;
  CODUSUEXEC: number;
  EXECUTOR: string;
  DTINI: string | null;
  DTFIN: string | null;
  TEMPO_MINUTOS: number | null;
  CODGRUPOPROD: number | null;
  OBS: string;
}

export interface OsDetalhadaApontamento {
  NUOS: number;
  SEQUENCIA: number;
  ID: number;
  CODEXEC: number;
  EXECUTOR: string;
  DHINI: string | null;
  DHFIN: string | null;
  TEMPO_MINUTOS: number | null;
  INTERVALO: number | null;
  STATUS: string | null;
  STATUS_DESCRICAO: string;
  DHAPONT: string | null;
}

export interface OsDetalhadaCompleta {
  cabecalho: OsDetalhadaCab;
  servicos: OsDetalhadaServico[];
  execucoes: OsDetalhadaExecucao[];
  apontamentos: OsDetalhadaApontamento[];
}

export interface HistoricoOsUnificado {
  tipoOs: string;
  numOs: number;
  dataInicio: string | null;
  dataFim: string | null;
  situacao: string;
  local: string;
  descricao: string;
  parceiro: string;
}

export interface OsManutencaoEnriched {
  NUOS: number;
  STATUS: string;
  STATUS_DESCRICAO: string;
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
  DURACAO_DIAS: number | null;
  IS_FINALIZADO: number;
}
