/**
 * Query para obter propriedades de um campo do dicionário de dados (TDDPCO).
 *
 * Retorna as propriedades/configurações adicionais de um campo.
 * Usado para customizações específicas do campo.
 *
 * @module Dicionário
 * @tabelas TDDPCO
 * @task D2-T08
 */
export interface ObterPropriedadesCampoParametros {
  nomeTabela: string;
  nomeCampo: string;
}

export class ObterPropriedadesCampoQuery {
  constructor(private readonly params: ObterPropriedadesCampoParametros) {}

  /**
   * SQL da query.
   * Lista propriedades ordenadas por nome.
   */
  get sql(): string {
    return `
      SELECT
        NOMETAB,
        NOMECAMPO,
        NOMEPROPRIEDADE,
        VALORPROPRIEDADE,
        TIPOPROPRIEDADE
      FROM TDDPCO
      WHERE NOMETAB = @param1
        AND NOMECAMPO = @param2
      ORDER BY NOMEPROPRIEDADE ASC
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
  readonly tabelas = ['TDDPCO'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = ['NOMETAB', 'NOMECAMPO', 'NOMEPROPRIEDADE', 'VALORPROPRIEDADE', 'TIPOPROPRIEDADE'];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Obtém propriedades/configurações adicionais de um campo';
}
