/**
 * Entity: EstatisticasQuery
 *
 * Representa estatísticas de execução de uma query do SQL Server.
 */
export interface DadosEstatisticasQuery {
  execution_count: number;
  total_cpu_ms: number;
  avg_cpu_ms: number;
  total_duration_ms: number;
  avg_duration_ms: number;
  total_logical_reads: number;
  total_logical_writes: number;
  total_physical_reads: number;
  last_execution_time: Date;
  creation_time: Date;
  plan_handle: string;
  sql_handle: string;
  query_text: string;
  database_name?: string;
  object_name?: string;
  query_source: 'SANKHYA' | 'SYSTEM' | 'EXTERNAL';
  cost_score: number;
}

export class EstatisticasQuery {
  readonly contagemExecucoes: number;
  readonly cpuTotalMs: number;
  readonly cpuMedioMs: number;
  readonly duracaoTotalMs: number;
  readonly duracaoMediaMs: number;
  readonly leiturasLogicasTotais: number;
  readonly escritasLogicasTotais: number;
  readonly leiturasFisicasTotais: number;
  readonly ultimaExecucao: Date;
  readonly dataCriacao: Date;
  readonly planHandle: string;
  readonly sqlHandle: string;
  readonly textoQuery: string;
  readonly nomeBancoDados?: string;
  readonly nomeObjeto?: string;
  readonly fonteQuery: 'SANKHYA' | 'SYSTEM' | 'EXTERNAL';
  readonly pontuacaoCusto: number;

  private constructor(dados: DadosEstatisticasQuery) {
    this.contagemExecucoes = dados.execution_count;
    this.cpuTotalMs = dados.total_cpu_ms;
    this.cpuMedioMs = dados.avg_cpu_ms;
    this.duracaoTotalMs = dados.total_duration_ms;
    this.duracaoMediaMs = dados.avg_duration_ms;
    this.leiturasLogicasTotais = dados.total_logical_reads;
    this.escritasLogicasTotais = dados.total_logical_writes;
    this.leiturasFisicasTotais = dados.total_physical_reads;
    this.ultimaExecucao = dados.last_execution_time;
    this.dataCriacao = dados.creation_time;
    this.planHandle = dados.plan_handle;
    this.sqlHandle = dados.sql_handle;
    this.textoQuery = dados.query_text;
    this.nomeBancoDados = dados.database_name;
    this.nomeObjeto = dados.object_name;
    this.fonteQuery = dados.query_source;
    this.pontuacaoCusto = dados.cost_score;
  }

  static criar(dados: DadosEstatisticasQuery): EstatisticasQuery {
    return new EstatisticasQuery(dados);
  }

  ehPesada(): boolean {
    return this.cpuTotalMs > 10000 || this.leiturasLogicasTotais > 100000;
  }

  ehSankhya(): boolean {
    return this.fonteQuery === 'SANKHYA';
  }
}
