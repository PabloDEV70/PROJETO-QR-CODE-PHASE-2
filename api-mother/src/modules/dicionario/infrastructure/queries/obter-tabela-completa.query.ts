/**
 * Query para obter tabela completa com metadados do dicionário de dados.
 *
 * Retorna a tabela com JOINs para incluir informações adicionais
 * como contagem de campos e relacionamentos.
 *
 * @module Dicionário
 * @tabelas TDDTAB, TDDCAM, TDDLIG
 * @task D2-T04
 */
export interface ObterTabelaCompletaParametros {
  nomeTabela: string;
}

export class ObterTabelaCompletaQuery {
  constructor(private readonly params: ObterTabelaCompletaParametros) {}

  /**
   * SQL da query.
   * Inclui contagem de campos e relacionamentos via subqueries.
   */
  get sql(): string {
    return `
      SELECT
        t.NOMETAB,
        t.DESCRICAO,
        t.NOMEINSTANCIA,
        t.MODULO,
        t.ATIVA,
        t.TIPOCRUD,
        (
          SELECT COUNT(*)
          FROM TDDCAM c
          WHERE c.NOMETAB = t.NOMETAB
        ) AS TOTAL_CAMPOS,
        (
          SELECT COUNT(*)
          FROM TDDCAM c
          WHERE c.NOMETAB = t.NOMETAB
            AND c.CHAVEPRIMARIA = 'S'
        ) AS TOTAL_CHAVES_PRIMARIAS,
        (
          SELECT COUNT(*)
          FROM TDDCAM c
          WHERE c.NOMETAB = t.NOMETAB
            AND c.CHAVEESTRANGEIRA = 'S'
        ) AS TOTAL_CHAVES_ESTRANGEIRAS,
        (
          SELECT COUNT(*)
          FROM TDDCAM c
          WHERE c.NOMETAB = t.NOMETAB
            AND c.OBRIGATORIO = 'S'
        ) AS TOTAL_OBRIGATORIOS,
        (
          SELECT COUNT(*)
          FROM TDDLIG l
          WHERE l.NOMETABORIG = t.NOMETAB
        ) AS TOTAL_RELACIONAMENTOS_SAIDA,
        (
          SELECT COUNT(*)
          FROM TDDLIG l
          WHERE l.NOMETABDEST = t.NOMETAB
        ) AS TOTAL_RELACIONAMENTOS_ENTRADA
      FROM TDDTAB t
      WHERE t.NOMETAB = @param1
    `;
  }

  /**
   * Parâmetros da query.
   */
  get parametros(): string[] {
    return [this.params.nomeTabela.toUpperCase()];
  }

  /**
   * Tabelas consultadas.
   */
  readonly tabelas = ['TDDTAB', 'TDDCAM', 'TDDLIG'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = [
    'NOMETAB',
    'DESCRICAO',
    'NOMEINSTANCIA',
    'MODULO',
    'ATIVA',
    'TIPOCRUD',
    'TOTAL_CAMPOS',
    'TOTAL_CHAVES_PRIMARIAS',
    'TOTAL_CHAVES_ESTRANGEIRAS',
    'TOTAL_OBRIGATORIOS',
    'TOTAL_RELACIONAMENTOS_SAIDA',
    'TOTAL_RELACIONAMENTOS_ENTRADA',
  ];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Obtém tabela completa com estatísticas de campos e relacionamentos';
}
