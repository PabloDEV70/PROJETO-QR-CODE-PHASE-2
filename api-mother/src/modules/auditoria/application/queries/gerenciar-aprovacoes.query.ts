/**
 * Query: GerenciarAprovacoes
 *
 * Queries para gerenciamento de aprovacoes pendentes.
 */

import { FiltrosAprovacao } from '../../domain/repositories';

export class InserirAprovacaoQuery {
  readonly sql = `
    INSERT INTO API_APROVACAO_PENDENTE (
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      OBSERVACAO_SOLICITANTE,
      IP_ORIGEM,
      PRIORIDADE
    )
    OUTPUT INSERTED.APROVACAOID
    VALUES (
      @param1,
      @param2,
      @param3,
      @param4,
      @param5,
      @param6,
      @param7,
      @param8,
      @param9,
      @param10,
      @param11,
      @param12
    )
  `;

  constructor(
    private readonly codUsuario: number,
    private readonly codAprovador: number | null,
    private readonly tabela: string,
    private readonly operacao: string,
    private readonly dados: string,
    private readonly chaveRegistro: string | null,
    private readonly status: string,
    private readonly dataSolicitacao: Date,
    private readonly dataExpiracao: Date | null,
    private readonly observacao: string | null,
    private readonly ip: string | null,
    private readonly prioridade: string,
  ) {}

  get parametros(): unknown[] {
    return [
      this.codUsuario,
      this.codAprovador,
      this.tabela,
      this.operacao,
      this.dados,
      this.chaveRegistro,
      this.status,
      this.dataSolicitacao,
      this.dataExpiracao,
      this.observacao,
      this.ip,
      this.prioridade,
    ];
  }
}

export class ConsultarAprovacoesPorFiltrosQuery {
  private readonly baseSelect = `
    SELECT
      APROVACAOID,
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      DATA_PROCESSAMENTO,
      MOTIVO_REJEICAO,
      OBSERVACAO_SOLICITANTE,
      OBSERVACAO_APROVADOR,
      IP_ORIGEM,
      PRIORIDADE
    FROM API_APROVACAO_PENDENTE
  `;

  private readonly baseCount = `
    SELECT COUNT(*) as TOTAL
    FROM API_APROVACAO_PENDENTE
  `;

  private condicoes: string[] = [];
  private _parametros: unknown[] = [];
  private paramIndex = 1;

  constructor(private readonly filtros: FiltrosAprovacao) {
    this.construirCondicoes();
  }

  private construirCondicoes(): void {
    if (this.filtros.codUsuario !== undefined) {
      this.condicoes.push(`CODUSU = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.codUsuario);
      this.paramIndex++;
    }

    if (this.filtros.codAprovador !== undefined) {
      this.condicoes.push(`CODAPROVADOR = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.codAprovador);
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

    if (this.filtros.status) {
      this.condicoes.push(`STATUS = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.status);
      this.paramIndex++;
    }

    if (this.filtros.prioridade) {
      this.condicoes.push(`PRIORIDADE = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.prioridade);
      this.paramIndex++;
    }

    if (this.filtros.dataInicio) {
      this.condicoes.push(`DATA_SOLICITACAO >= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataInicio);
      this.paramIndex++;
    }

    if (this.filtros.dataFim) {
      this.condicoes.push(`DATA_SOLICITACAO <= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataFim);
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
      ORDER BY
        CASE PRIORIDADE WHEN 'A' THEN 1 WHEN 'N' THEN 2 WHEN 'B' THEN 3 END,
        DATA_SOLICITACAO DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limite} ROWS ONLY
    `;
  }

  get parametros(): unknown[] {
    return this._parametros;
  }
}

export class ConsultarAprovacaoPorIdQuery {
  readonly sql = `
    SELECT
      APROVACAOID,
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      DATA_PROCESSAMENTO,
      MOTIVO_REJEICAO,
      OBSERVACAO_SOLICITANTE,
      OBSERVACAO_APROVADOR,
      IP_ORIGEM,
      PRIORIDADE
    FROM API_APROVACAO_PENDENTE
    WHERE APROVACAOID = @param1
  `;

  constructor(private readonly aprovacaoId: number) {}

  get parametros(): unknown[] {
    return [this.aprovacaoId];
  }
}

export class ListarAprovacoesPendentesQuery {
  readonly sql = `
    SELECT
      APROVACAOID,
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      DATA_PROCESSAMENTO,
      MOTIVO_REJEICAO,
      OBSERVACAO_SOLICITANTE,
      OBSERVACAO_APROVADOR,
      IP_ORIGEM,
      PRIORIDADE
    FROM API_APROVACAO_PENDENTE
    WHERE STATUS = 'P'
      AND (CODAPROVADOR IS NULL OR CODAPROVADOR = @param1)
    ORDER BY
      CASE PRIORIDADE WHEN 'A' THEN 1 WHEN 'N' THEN 2 WHEN 'B' THEN 3 END,
      DATA_SOLICITACAO ASC
  `;

  readonly sqlSemAprovador = `
    SELECT
      APROVACAOID,
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      DATA_PROCESSAMENTO,
      MOTIVO_REJEICAO,
      OBSERVACAO_SOLICITANTE,
      OBSERVACAO_APROVADOR,
      IP_ORIGEM,
      PRIORIDADE
    FROM API_APROVACAO_PENDENTE
    WHERE STATUS = 'P'
    ORDER BY
      CASE PRIORIDADE WHEN 'A' THEN 1 WHEN 'N' THEN 2 WHEN 'B' THEN 3 END,
      DATA_SOLICITACAO ASC
  `;

  constructor(private readonly codAprovador?: number) {}

  get parametros(): unknown[] {
    return this.codAprovador !== undefined ? [this.codAprovador] : [];
  }

  get sqlFinal(): string {
    return this.codAprovador !== undefined ? this.sql : this.sqlSemAprovador;
  }
}

export class ProcessarAprovacaoQuery {
  readonly sql = `
    UPDATE API_APROVACAO_PENDENTE
    SET
      CODAPROVADOR = @param2,
      STATUS = @param3,
      DATA_PROCESSAMENTO = @param4,
      MOTIVO_REJEICAO = @param5,
      OBSERVACAO_APROVADOR = @param6
    WHERE APROVACAOID = @param1
      AND STATUS = 'P'
  `;

  constructor(
    private readonly aprovacaoId: number,
    private readonly codAprovador: number,
    private readonly novoStatus: 'A' | 'R',
    private readonly dataProcessamento: Date,
    private readonly motivoRejeicao: string | null,
    private readonly observacao: string | null,
  ) {}

  get parametros(): unknown[] {
    return [
      this.aprovacaoId,
      this.codAprovador,
      this.novoStatus,
      this.dataProcessamento,
      this.motivoRejeicao,
      this.observacao,
    ];
  }
}

export class CancelarAprovacaoQuery {
  readonly sql = `
    UPDATE API_APROVACAO_PENDENTE
    SET
      STATUS = 'C',
      DATA_PROCESSAMENTO = GETDATE()
    WHERE APROVACAOID = @param1
      AND CODUSU = @param2
      AND STATUS = 'P'
  `;

  constructor(
    private readonly aprovacaoId: number,
    private readonly codUsuario: number,
  ) {}

  get parametros(): unknown[] {
    return [this.aprovacaoId, this.codUsuario];
  }
}

export class ExpirarAprovacoesQuery {
  readonly sql = `
    UPDATE API_APROVACAO_PENDENTE
    SET
      STATUS = 'E',
      DATA_PROCESSAMENTO = GETDATE()
    WHERE STATUS = 'P'
      AND DATA_EXPIRACAO IS NOT NULL
      AND DATA_EXPIRACAO < GETDATE()
  `;

  get parametros(): unknown[] {
    return [];
  }
}

export class BuscarProximasDeExpirarQuery {
  readonly sql = `
    SELECT
      APROVACAOID,
      CODUSU,
      CODAPROVADOR,
      TABELA,
      OPERACAO,
      DADOS,
      CHAVE_REGISTRO,
      STATUS,
      DATA_SOLICITACAO,
      DATA_EXPIRACAO,
      DATA_PROCESSAMENTO,
      MOTIVO_REJEICAO,
      OBSERVACAO_SOLICITANTE,
      OBSERVACAO_APROVADOR,
      IP_ORIGEM,
      PRIORIDADE
    FROM API_APROVACAO_PENDENTE
    WHERE STATUS = 'P'
      AND DATA_EXPIRACAO IS NOT NULL
      AND DATA_EXPIRACAO <= DATEADD(HOUR, @param1, GETDATE())
      AND DATA_EXPIRACAO > GETDATE()
    ORDER BY DATA_EXPIRACAO ASC
  `;

  constructor(private readonly horasRestantes: number) {}

  get parametros(): unknown[] {
    return [this.horasRestantes];
  }
}

export class ContarPendentesPorAprovadorQuery {
  readonly sql = `
    SELECT COUNT(*) as TOTAL
    FROM API_APROVACAO_PENDENTE
    WHERE STATUS = 'P'
      AND (CODAPROVADOR IS NULL OR CODAPROVADOR = @param1)
  `;

  constructor(private readonly codAprovador: number) {}

  get parametros(): unknown[] {
    return [this.codAprovador];
  }
}

export class EstatisticasAprovacaoQuery {
  readonly sql = `
    SELECT
      SUM(CASE WHEN STATUS = 'P' THEN 1 ELSE 0 END) as TOTAL_PENDENTES,
      SUM(CASE WHEN STATUS = 'A' THEN 1 ELSE 0 END) as TOTAL_APROVADAS,
      SUM(CASE WHEN STATUS = 'R' THEN 1 ELSE 0 END) as TOTAL_REJEITADAS,
      SUM(CASE WHEN STATUS = 'E' THEN 1 ELSE 0 END) as TOTAL_EXPIRADAS,
      SUM(CASE WHEN STATUS = 'C' THEN 1 ELSE 0 END) as TOTAL_CANCELADAS
    FROM API_APROVACAO_PENDENTE
  `;

  private condicoes: string[] = [];
  private _parametros: unknown[] = [];
  private paramIndex = 1;

  constructor(private readonly filtros: FiltrosAprovacao) {
    this.construirCondicoes();
  }

  private construirCondicoes(): void {
    if (this.filtros.tabela) {
      this.condicoes.push(`TABELA = @param${this.paramIndex}`);
      this._parametros.push(this.filtros.tabela.toUpperCase());
      this.paramIndex++;
    }

    if (this.filtros.dataInicio) {
      this.condicoes.push(`DATA_SOLICITACAO >= @param${this.paramIndex}`);
      this._parametros.push(this.filtros.dataInicio);
      this.paramIndex++;
    }

    if (this.filtros.dataFim) {
      this.condicoes.push(`DATA_SOLICITACAO <= @param${this.paramIndex}`);
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
