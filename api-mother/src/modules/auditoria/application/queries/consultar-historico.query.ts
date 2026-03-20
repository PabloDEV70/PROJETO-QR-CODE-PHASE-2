/**
 * Query: ConsultarHistorico
 *
 * Consulta registros de auditoria com filtros.
 */

import { FiltrosHistorico } from '../../domain/repositories';

export class ConsultarHistoricoQuery {
  private readonly baseSelect = `
    SELECT
      AUDITORIAID,
      CODUSU,
      TABELA,
      OPERACAO,
      DADOS_ANTIGOS,
      DADOS_NOVOS,
      DATA_HORA,
      IP_ORIGEM,
      USER_AGENT,
      CHAVE_REGISTRO,
      OBSERVACAO,
      SUCESSO,
      MENSAGEM_ERRO
    FROM API_AUDITORIA
  `;

  private readonly baseCount = `
    SELECT COUNT(*) as TOTAL
    FROM API_AUDITORIA
  `;

  private condicoes: string[] = [];
  private _parametros: unknown[] = [];
  private paramIndex = 1;

  constructor(private readonly filtros: FiltrosHistorico) {
    this.construirCondicoes();
  }

  private construirCondicoes(): void {
    if (this.filtros.codUsuario !== undefined) {
      this.condicoes.push(`CODUSU = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.codUsuario);
      this.paramIndex++;
    }

    if (this.filtros.tabela) {
      this.condicoes.push(`TABELA = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.tabela.toUpperCase());
      this.paramIndex++;
    }

    if (this.filtros.operacao) {
      this.condicoes.push(`OPERACAO = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.operacao);
      this.paramIndex++;
    }

    if (this.filtros.dataInicio) {
      this.condicoes.push(`DATA_HORA >= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataInicio);
      this.paramIndex++;
    }

    if (this.filtros.dataFim) {
      this.condicoes.push(`DATA_HORA <= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataFim);
      this.paramIndex++;
    }

    if (this.filtros.sucesso) {
      this.condicoes.push(`SUCESSO = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.sucesso);
      this.paramIndex++;
    }

    if (this.filtros.chaveRegistro) {
      this.condicoes.push(`CHAVE_REGISTRO LIKE @param${this.paramIndex}`);
      this._parametros.push(`%${this.filtros.chaveRegistro}%`);
      this.paramIndex++;
    }
  }

  private obterClausulaWhere(): string {
    return this.condicoes.length > 0 ? `WHERE ${this.condicoes.join(' AND ')}` : '';
  }

  get sqlContagem(): string {
    return `${this.baseCount} ${this.obterClausulaWhere()}`;
  }

  get sqlDados(): string {
    const limite = this.filtros.limite || 50;
    const offset = this.filtros.offset || 0;

    return `
      ${this.baseSelect}
      ${this.obterClausulaWhere()}
      ORDER BY DATA_HORA DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limite} ROWS ONLY
    `;
  }

  get parametros(): unknown[] {
    return this._parametros;
  }
}

export class ConsultarHistoricoPorIdQuery {
  readonly sql = `
    SELECT
      AUDITORIAID,
      CODUSU,
      TABELA,
      OPERACAO,
      DADOS_ANTIGOS,
      DADOS_NOVOS,
      DATA_HORA,
      IP_ORIGEM,
      USER_AGENT,
      CHAVE_REGISTRO,
      OBSERVACAO,
      SUCESSO,
      MENSAGEM_ERRO
    FROM API_AUDITORIA
    WHERE AUDITORIAID = @param1
  `;

  constructor(private readonly auditoriaId: number) {}

  get parametros(): unknown[] {
    return [this.auditoriaId];
  }
}

export class ConsultarHistoricoPorTabelaEChaveQuery {
  readonly sql = `
    SELECT
      AUDITORIAID,
      CODUSU,
      TABELA,
      OPERACAO,
      DADOS_ANTIGOS,
      DADOS_NOVOS,
      DATA_HORA,
      IP_ORIGEM,
      USER_AGENT,
      CHAVE_REGISTRO,
      OBSERVACAO,
      SUCESSO,
      MENSAGEM_ERRO
    FROM API_AUDITORIA
    WHERE TABELA = @param1
      AND CHAVE_REGISTRO = @param2
    ORDER BY DATA_HORA DESC
  `;

  constructor(
    private readonly tabela: string,
    private readonly chaveRegistro: string,
  ) {}

  get parametros(): unknown[] {
    return [this.tabela.toUpperCase(), this.chaveRegistro];
  }
}

export class ConsultarUltimosRegistrosQuery {
  readonly sql = `
    SELECT TOP (@param2)
      AUDITORIAID,
      CODUSU,
      TABELA,
      OPERACAO,
      DADOS_ANTIGOS,
      DADOS_NOVOS,
      DATA_HORA,
      IP_ORIGEM,
      USER_AGENT,
      CHAVE_REGISTRO,
      OBSERVACAO,
      SUCESSO,
      MENSAGEM_ERRO
    FROM API_AUDITORIA
    WHERE TABELA = @param1
    ORDER BY DATA_HORA DESC
  `;

  constructor(
    private readonly tabela: string,
    private readonly limite: number,
  ) {}

  get parametros(): unknown[] {
    return [this.tabela.toUpperCase(), this.limite];
  }
}

export class ConsultarEstatisticasQuery {
  readonly sql = `
    SELECT
      COUNT(*) as TOTAL_REGISTROS,
      SUM(CASE WHEN OPERACAO = 'I' THEN 1 ELSE 0 END) as TOTAL_INSERTS,
      SUM(CASE WHEN OPERACAO = 'U' THEN 1 ELSE 0 END) as TOTAL_UPDATES,
      SUM(CASE WHEN OPERACAO = 'D' THEN 1 ELSE 0 END) as TOTAL_DELETES,
      SUM(CASE WHEN OPERACAO = 'S' THEN 1 ELSE 0 END) as TOTAL_SELECTS,
      SUM(CASE WHEN SUCESSO = 'S' THEN 1 ELSE 0 END) as TOTAL_SUCESSOS,
      SUM(CASE WHEN SUCESSO = 'N' THEN 1 ELSE 0 END) as TOTAL_FALHAS
    FROM API_AUDITORIA
  `;

  private condicoes: string[] = [];
  private _parametros: unknown[] = [];
  private paramIndex = 1;

  constructor(private readonly filtros: FiltrosHistorico) {
    this.construirCondicoes();
  }

  private construirCondicoes(): void {
    if (this.filtros.tabela) {
      this.condicoes.push(`TABELA = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.tabela.toUpperCase());
      this.paramIndex++;
    }

    if (this.filtros.dataInicio) {
      this.condicoes.push(`DATA_HORA >= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataInicio);
      this.paramIndex++;
    }

    if (this.filtros.dataFim) {
      this.condicoes.push(`DATA_HORA <= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataFim);
      this.paramIndex++;
    }
  }

  get sqlCompleto(): string {
    const where = this.condicoes.length > 0 ? `WHERE ${this.condicoes.join(' AND ')}` : '';
    return `${this.sql} ${where}`;
  }

  get parametros(): unknown[] {
    return this._parametros;
  }
}
