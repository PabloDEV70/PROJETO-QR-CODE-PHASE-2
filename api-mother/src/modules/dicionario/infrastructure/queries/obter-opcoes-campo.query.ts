/**
 * Query para obter opções de um campo do dicionário de dados (TDDOPC).
 *
 * Retorna as opções de valores válidos para campos com lista de opções.
 * Usado para campos tipo combo/dropdown.
 *
 * @module Dicionário
 * @tabelas TDDOPC
 * @task D2-T07
 */
export interface ObterOpcoesCampoParametros {
  nomeTabela: string;
  nomeCampo: string;
}

export class ObterOpcoesCampoQuery {
  constructor(private readonly params: ObterOpcoesCampoParametros) {}

  /**
   * SQL da query.
   * Lista opções ordenadas por valor.
   */
  get sql(): string {
    return `
      SELECT
        NOMETAB,
        NOMECAMPO,
        VALOR,
        DESCRICAO,
        ORDEM
      FROM TDDOPC
      WHERE NOMETAB = @param1
        AND NOMECAMPO = @param2
      ORDER BY
        CASE WHEN ORDEM IS NULL THEN 999999 ELSE ORDEM END ASC,
        VALOR ASC
    `;
  }

  /**
   * Parâmetros da query.
   */
  get parametros(): string[] {
    return [this.params.nomeTabela.toUpperCase(), this.params.nomeCampo.toUpperCase()];
  }

  /**
   * Tabelas consultadas.
   */
  readonly tabelas = ['TDDOPC'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = ['NOMETAB', 'NOMECAMPO', 'VALOR', 'DESCRICAO', 'ORDEM'];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Obtém opções de valores válidos para um campo específico';
}
