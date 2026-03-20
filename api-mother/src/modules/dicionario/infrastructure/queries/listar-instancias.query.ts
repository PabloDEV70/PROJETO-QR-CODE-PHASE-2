/**
 * Query para listar instâncias da tabela TDDINS.
 *
 * A tabela TDDINS armazena as definições de instâncias (entidades)
 * do dicionário de dados Sankhya.
 *
 * @module Dicionario
 * @tabela TDDINS
 */

/**
 * Parâmetros de filtro para listagem de instâncias.
 */
export interface ListarInstanciasParametros {
  /** Filtrar apenas instâncias ativas */
  apenasAtivas?: boolean;
  /** Filtrar por nome da tabela */
  nomeTabela?: string;
}

/**
 * Query para listar todas as instâncias do dicionário de dados.
 *
 * Permite filtrar por status ativo e por tabela específica.
 *
 * @example
 * ```typescript
 * // Listar todas as instâncias
 * const query = new ListarInstanciasQuery();
 *
 * // Listar apenas instâncias ativas
 * const query = new ListarInstanciasQuery({ apenasAtivas: true });
 *
 * // Listar instâncias de uma tabela específica
 * const query = new ListarInstanciasQuery({ nomeTabela: 'TGFPRO' });
 * ```
 */
export class ListarInstanciasQuery {
  private readonly _parametros: Record<string, unknown> = {};

  constructor(private readonly filtros?: ListarInstanciasParametros) {}

  /**
   * Obtém o SQL da query.
   */
  get sql(): string {
    const condicoes: string[] = [];

    if (this.filtros?.apenasAtivas) {
      condicoes.push("ATIVA = 'S'");
    }

    if (this.filtros?.nomeTabela) {
      condicoes.push('NOMETAB = @nomeTabela');
      this._parametros.nomeTabela = this.filtros.nomeTabela.toUpperCase();
    }

    const whereClause = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

    return `
      SELECT
        NOMEINSTANCIA as nomeInstancia,
        NOMETAB as nomeTabela,
        DESCRICAO as descricao,
        ORDEM as ordem,
        ATIVA as ativa
      FROM TDDINS
      ${whereClause}
      ORDER BY NOMETAB, ORDEM
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    // Força o cálculo do SQL para preencher parâmetros
    void this.sql;
    return { ...this._parametros };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS'];

  /** Campos retornados pela query */
  readonly campos = ['NOMEINSTANCIA', 'NOMETAB', 'DESCRICAO', 'ORDEM', 'ATIVA'];

  /** Descrição da query para documentação */
  readonly descricao = 'Lista instâncias do dicionário de dados com filtros opcionais';
}
