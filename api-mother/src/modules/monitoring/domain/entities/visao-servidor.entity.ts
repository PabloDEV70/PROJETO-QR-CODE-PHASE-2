/**
 * Entity: VisaoServidor
 *
 * Representa uma visão geral do servidor SQL Server.
 */
export interface DadosVisaoServidor {
  sql_version: string;
  server_name: string;
  current_database: string;
  active_user_sessions: number;
  active_requests: number;
  user_connections: number;
  server_time: Date;
}

export class VisaoServidor {
  readonly versaoSql: string;
  readonly nomeServidor: string;
  readonly bancoAtual: string;
  readonly sessoesUsuarioAtivas: number;
  readonly requisicaosAtivas: number;
  readonly conexoesUsuario: number;
  readonly horaServidor: Date;

  private constructor(dados: DadosVisaoServidor) {
    this.versaoSql = dados.sql_version;
    this.nomeServidor = dados.server_name;
    this.bancoAtual = dados.current_database;
    this.sessoesUsuarioAtivas = dados.active_user_sessions;
    this.requisicaosAtivas = dados.active_requests;
    this.conexoesUsuario = dados.user_connections;
    this.horaServidor = dados.server_time;
  }

  static criar(dados: DadosVisaoServidor): VisaoServidor {
    return new VisaoServidor(dados);
  }

  obterVersaoSimplificada(): string {
    // Extrair apenas "SQL Server 2019" ou similar
    const match = this.versaoSql.match(/Microsoft SQL Server (\d{4})/);
    return match ? `SQL Server ${match[1]}` : 'SQL Server';
  }

  temCargaAlta(): boolean {
    return this.sessoesUsuarioAtivas > 100 || this.requisicaosAtivas > 50;
  }
}
