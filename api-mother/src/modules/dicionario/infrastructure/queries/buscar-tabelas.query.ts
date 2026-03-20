/**
 * Query para buscar tabelas por termo no dicionário de dados (TDDTAB).
 *
 * Busca tabelas que contenham o termo no nome ou descrição.
 *
 * @module Dicionário
 * @tabelas TDDTAB
 * @task D2-T03
 */
export interface BuscarTabelasParametros {
  termo: string;
}

export class BuscarTabelasQuery {
  constructor(private readonly params: BuscarTabelasParametros) {}

  /**
   * SQL da query.
   * Busca por LIKE em NOMETAB e DESCRICAO.
   */
  get sql(): string {
    return `
      SELECT
        NOMETAB,
        DESCRICAO,
        NOMEINSTANCIA,
        MODULO,
        ATIVA,
        TIPOCRUD
      FROM TDDTAB
      WHERE NOMETAB LIKE @param1
         OR DESCRICAO LIKE @param1
      ORDER BY NOMETAB ASC
    `;
  }

  /**
   * Parâmetros da query.
   * Aplica wildcards para busca parcial.
   */
  get parametros(): string[] {
    const termoFormatado = `%${this.params.termo.toUpperCase()}%`;
    return [termoFormatado];
  }

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
  readonly descricao = 'Busca tabelas por termo no nome ou descrição';
}
