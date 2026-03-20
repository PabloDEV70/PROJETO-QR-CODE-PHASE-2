/**
 * Query para listar relacionamentos da tabela TDDLIG.
 *
 * A tabela TDDLIG armazena os vínculos entre instâncias
 * do dicionário de dados Sankhya.
 *
 * @module Dicionario
 * @tabela TDDLIG
 */

/**
 * Parâmetros de filtro para listagem de relacionamentos.
 */
export interface ListarRelacionamentosParametros {
  /** Filtrar por instância pai específica */
  nomeInstanciaPai?: string;
  /** Filtrar por instância filho específica */
  nomeInstanciaFilho?: string;
  /** Filtrar por tipo de ligação (ex: 'D' para dependência) */
  tipoLigacao?: string;
  /** Filtrar apenas relacionamentos ativos */
  apenasAtivos?: boolean;
}

/**
 * Query para listar relacionamentos entre instâncias.
 *
 * Permite filtrar por instância pai, filho, tipo de ligação e status.
 *
 * @example
 * ```typescript
 * // Listar todos os relacionamentos
 * const query = new ListarRelacionamentosQuery();
 *
 * // Listar filhos de uma instância
 * const query = new ListarRelacionamentosQuery({ nomeInstanciaPai: 'Produto' });
 *
 * // Listar pais de uma instância
 * const query = new ListarRelacionamentosQuery({ nomeInstanciaFilho: 'ItemPedido' });
 * ```
 */
export class ListarRelacionamentosQuery {
  private readonly _parametros: Record<string, unknown> = {};

  constructor(private readonly filtros?: ListarRelacionamentosParametros) {}

  /**
   * Obtém o SQL da query.
   */
  get sql(): string {
    const condicoes: string[] = [];

    if (this.filtros?.nomeInstanciaPai) {
      condicoes.push('UPPER(NOMEINSTANCIAPAI) = UPPER(@nomeInstanciaPai)');
      this._parametros.nomeInstanciaPai = this.filtros.nomeInstanciaPai.trim();
    }

    if (this.filtros?.nomeInstanciaFilho) {
      condicoes.push('UPPER(NOMEINSTANCIAFILHO) = UPPER(@nomeInstanciaFilho)');
      this._parametros.nomeInstanciaFilho = this.filtros.nomeInstanciaFilho.trim();
    }

    if (this.filtros?.tipoLigacao) {
      condicoes.push('TIPOLIGACAO = @tipoLigacao');
      this._parametros.tipoLigacao = this.filtros.tipoLigacao.trim();
    }

    if (this.filtros?.apenasAtivos) {
      condicoes.push("ATIVO = 'S'");
    }

    const whereClause = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

    return `
      SELECT
        NOMEINSTANCIAPAI as nomeInstanciaPai,
        NOMEINSTANCIAFILHO as nomeInstanciaFilho,
        TIPOLIGACAO as tipoLigacao,
        ORDEM as ordem,
        ATIVO as ativo
      FROM TDDLIG
      ${whereClause}
      ORDER BY NOMEINSTANCIAPAI, ORDEM
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
  readonly tabelas = ['TDDLIG'];

  /** Campos retornados pela query */
  readonly campos = ['NOMEINSTANCIAPAI', 'NOMEINSTANCIAFILHO', 'TIPOLIGACAO', 'ORDEM', 'ATIVO'];

  /** Descrição da query para documentação */
  readonly descricao = 'Lista relacionamentos entre instâncias do dicionário';
}
