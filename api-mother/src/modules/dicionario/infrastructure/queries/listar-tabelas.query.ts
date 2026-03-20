/**
 * Query para listar tabelas do dicionário de dados (TDDTAB).
 *
 * Retorna todas as tabelas cadastradas no sistema Sankhya.
 *
 * @module Dicionário
 * @tabelas TDDTAB
 * @task D2-T01
 */
export class ListarTabelasQuery {
  /**
   * SQL da query.
   * Lista tabelas ordenadas por nome.
   */
  readonly sql = `
    SELECT
      NOMETAB,
      DESCRICAO,
      NOMEINSTANCIA,
      MODULO,
      ATIVA,
      TIPOCRUD
    FROM TDDTAB
    ORDER BY NOMETAB ASC
  `;

  /**
   * Parâmetros da query (nenhum para listagem).
   */
  readonly parametros = {};

  /**
   * Tabelas consultadas.
   */
  readonly tabelas = ['TDDTAB'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = ['NOMETAB', 'DESCRICAO', 'NOMEINSTANCIA', 'MODULO', 'ATIVA', 'TIPOCRUD'];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Lista todas as tabelas do dicionário de dados ordenadas por nome';
}
