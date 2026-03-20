/**
 * Entity: EstatisticaEspera
 *
 * Representa estatísticas de espera do SQL Server.
 */
export interface DadosEstatisticaEspera {
  wait_type: string;
  waiting_tasks_count: number;
  wait_time_ms: number;
  max_wait_time_ms: number;
  signal_wait_time_ms: number;
  resource_wait_time_ms: number;
  avg_wait_time_ms: number;
}

export class EstatisticaEspera {
  readonly tipoEspera: string;
  readonly contagemTarefasEsperando: number;
  readonly tempoEsperaMs: number;
  readonly tempoMaximoEsperaMs: number;
  readonly tempoSinalMs: number;
  readonly tempoRecursoMs: number;
  readonly tempoMedioEsperaMs: number;

  private constructor(dados: DadosEstatisticaEspera) {
    this.tipoEspera = dados.wait_type;
    this.contagemTarefasEsperando = dados.waiting_tasks_count;
    this.tempoEsperaMs = dados.wait_time_ms;
    this.tempoMaximoEsperaMs = dados.max_wait_time_ms;
    this.tempoSinalMs = dados.signal_wait_time_ms;
    this.tempoRecursoMs = dados.resource_wait_time_ms;
    this.tempoMedioEsperaMs = dados.avg_wait_time_ms;
  }

  static criar(dados: DadosEstatisticaEspera): EstatisticaEspera {
    return new EstatisticaEspera(dados);
  }

  ehCritica(): boolean {
    return this.tempoEsperaMs > 60000; // Mais de 1 minuto
  }

  percentualSinal(): number {
    if (this.tempoEsperaMs === 0) return 0;
    return Math.round((this.tempoSinalMs / this.tempoEsperaMs) * 100);
  }
}
