/**
 * Entity: SessaoAtiva
 *
 * Representa uma sessão ativa no SQL Server.
 */
export interface DadosSessaoAtiva {
  session_id: number;
  login_time: Date;
  host_name?: string;
  program_name?: string;
  login_name: string;
  status: string;
  cpu_time: number;
  memory_usage: number;
  total_scheduled_time: number;
  total_elapsed_time: number;
  last_request_start_time?: Date;
  last_request_end_time?: Date;
  reads: number;
  writes: number;
  logical_reads: number;
  database_name?: string;
  client_net_address?: string;
}

export class SessaoAtiva {
  readonly idSessao: number;
  readonly horaLogin: Date;
  readonly nomeHost?: string;
  readonly nomePrograma?: string;
  readonly nomeLogin: string;
  readonly status: string;
  readonly tempoCpu: number;
  readonly usoMemoria: number;
  readonly tempoAgendadoTotal: number;
  readonly tempoDecorridoTotal: number;
  readonly inicioUltimaRequisicao?: Date;
  readonly fimUltimaRequisicao?: Date;
  readonly leituras: number;
  readonly escritas: number;
  readonly leiturasLogicas: number;
  readonly nomeBancoDados?: string;
  readonly enderecoClienteRede?: string;

  private constructor(dados: DadosSessaoAtiva) {
    this.idSessao = dados.session_id;
    this.horaLogin = dados.login_time;
    this.nomeHost = dados.host_name;
    this.nomePrograma = dados.program_name;
    this.nomeLogin = dados.login_name;
    this.status = dados.status;
    this.tempoCpu = dados.cpu_time;
    this.usoMemoria = dados.memory_usage;
    this.tempoAgendadoTotal = dados.total_scheduled_time;
    this.tempoDecorridoTotal = dados.total_elapsed_time;
    this.inicioUltimaRequisicao = dados.last_request_start_time;
    this.fimUltimaRequisicao = dados.last_request_end_time;
    this.leituras = dados.reads;
    this.escritas = dados.writes;
    this.leiturasLogicas = dados.logical_reads;
    this.nomeBancoDados = dados.database_name;
    this.enderecoClienteRede = dados.client_net_address;
  }

  static criar(dados: DadosSessaoAtiva): SessaoAtiva {
    return new SessaoAtiva(dados);
  }

  estaAtiva(): boolean {
    return this.status === 'running';
  }

  tempoConectadoEmMinutos(): number {
    const agora = new Date();
    return Math.floor((agora.getTime() - this.horaLogin.getTime()) / 60000);
  }
}
