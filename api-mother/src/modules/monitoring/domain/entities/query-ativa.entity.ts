/**
 * Entity: QueryAtiva
 *
 * Representa uma query em execução no SQL Server.
 */
export interface DadosQueryAtiva {
  session_id: number;
  status: string;
  command: string;
  cpu_time: number;
  total_elapsed_time: number;
  wait_type?: string;
  wait_time?: number;
  blocking_session_id?: number;
  open_transaction_count: number;
  database_id: number;
  database_name: string;
  query_text: string;
}

export class QueryAtiva {
  readonly idSessao: number;
  readonly status: string;
  readonly comando: string;
  readonly tempoCpu: number;
  readonly tempoTotalDecorrido: number;
  readonly tipoEspera?: string;
  readonly tempoEspera?: number;
  readonly idSessaoBloqueadora?: number;
  readonly contagemTransacoesAbertas: number;
  readonly idBancoDados: number;
  readonly nomeBancoDados: string;
  readonly textoQuery: string;

  private constructor(dados: DadosQueryAtiva) {
    this.idSessao = dados.session_id;
    this.status = dados.status;
    this.comando = dados.command;
    this.tempoCpu = dados.cpu_time;
    this.tempoTotalDecorrido = dados.total_elapsed_time;
    this.tipoEspera = dados.wait_type;
    this.tempoEspera = dados.wait_time;
    this.idSessaoBloqueadora = dados.blocking_session_id;
    this.contagemTransacoesAbertas = dados.open_transaction_count;
    this.idBancoDados = dados.database_id;
    this.nomeBancoDados = dados.database_name;
    this.textoQuery = dados.query_text;
  }

  static criar(dados: DadosQueryAtiva): QueryAtiva {
    return new QueryAtiva(dados);
  }

  estaBloqueada(): boolean {
    return this.idSessaoBloqueadora !== undefined && this.idSessaoBloqueadora > 0;
  }

  estaEmEspera(): boolean {
    return this.tipoEspera !== undefined && this.tempoEspera !== undefined && this.tempoEspera > 0;
  }

  tempoDecorridoEmSegundos(): number {
    return Math.floor(this.tempoTotalDecorrido / 1000);
  }
}
