/**
 * Execução de serviço de manutenção
 * Rastreamento granular de quem fez o quê e quando
 */
export interface Execucao {
  nuos: number;
  sequencia: number;
  codusu: number | null;
  codusuexec: number | null;
  dtini: Date | null;
  dtfin: Date | null;
  obs: string | null;
  codgrupoprod: number | null;
}

/**
 * Execução com dados do executor
 */
export interface ExecucaoComExecutor extends Execucao {
  nomeExecutor: string | null;
  minutosExecucao: number | null;
}

/**
 * Histórico completo de uma OS com todas as execuções
 */
export interface HistoricoExecucaoOs {
  nuos: number;
  codveiculo: number;
  placa: string | null;
  status: string | null;
  dtAbertura: Date | null;
  dataIni: Date | null;
  dataFin: Date | null;
  execucoes: ExecucaoDetalhe[];
}

/**
 * Detalhe de uma execução no histórico
 */
export interface ExecucaoDetalhe {
  sequencia: number;
  codprod: number | null;
  servico: string | null;
  codusuexec: number | null;
  nomeExecutor: string | null;
  dtini: Date | null;
  dtfin: Date | null;
  minutosExecucao: number | null;
  obsExecucao: string | null;
  obsServico: string | null;
}
