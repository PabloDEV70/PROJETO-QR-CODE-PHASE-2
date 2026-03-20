/**
 * Histórico completo de manutenção de um veículo
 */
export interface HistoricoVeiculo {
  codveiculo: number;
  placa: string | null;
  marcaModelo: string | null;
  totalOs: number;
  corretivas: number;
  preventivas: number;
  primeiraOs: Date | null;
  ultimaOs: Date | null;
  mediaDiasManutencao: number | null;
}

/**
 * OS resumida para listagem no histórico
 */
export interface OsHistoricoItem {
  nuos: number;
  dtAbertura: Date | null;
  dataIni: Date | null;
  dataFin: Date | null;
  status: string | null;
  statusLabel: string | null;
  manutencao: string | null;
  manutencaoLabel: string | null;
  km: number | null;
  horimetro: number | null;
  diasEmManutencao: number | null;
}

/**
 * Serviço mais executado no veículo
 */
export interface ServicoMaisExecutado {
  codprod: number;
  servico: string | null;
  execucoes: number;
  totalOs: number;
  ultimaExecucao: Date | null;
}

/**
 * Observação técnica do histórico
 */
export interface ObservacaoHistorico {
  nuos: number;
  sequencia: number;
  servico: string | null;
  obsServico: string | null;
  obsExecucao: string | null;
  dataExecucao: Date | null;
}
