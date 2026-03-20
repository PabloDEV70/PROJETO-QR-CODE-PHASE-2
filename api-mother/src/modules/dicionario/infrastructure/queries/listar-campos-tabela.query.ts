/**
 * Query para listar campos de uma tabela do dicionário de dados (TDDCAM).
 *
 * Retorna todos os campos cadastrados para uma tabela específica.
 *
 * @module Dicionário
 * @tabelas TDDCAM
 * @task D2-T05
 */
export interface ListarCamposTabelaParametros {
  nomeTabela: string;
}

export class ListarCamposTabelaQuery {
  constructor(private readonly params: ListarCamposTabelaParametros) {}

  /**
   * SQL da query.
   * Lista campos ordenados por nome.
   */
  get sql(): string {
    return `
      SELECT
        NOMETAB,
        NOMECAMPO,
        DESCRICAO,
        TIPO,
        TAMANHO,
        DECIMAIS,
        OBRIGATORIO,
        CHAVEPRIMARIA,
        CHAVEESTRANGEIRA,
        APRESENTACAO,
        VALORPADRAO
      FROM TDDCAM
      WHERE NOMETAB = @param1
      ORDER BY
        CASE WHEN CHAVEPRIMARIA = 'S' THEN 0 ELSE 1 END,
        CASE WHEN OBRIGATORIO = 'S' THEN 0 ELSE 1 END,
        NOMECAMPO ASC
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
  readonly tabelas = ['TDDCAM'];

  /**
   * Campos retornados pela query.
   */
  readonly campos = [
    'NOMETAB',
    'NOMECAMPO',
    'DESCRICAO',
    'TIPO',
    'TAMANHO',
    'DECIMAIS',
    'OBRIGATORIO',
    'CHAVEPRIMARIA',
    'CHAVEESTRANGEIRA',
    'APRESENTACAO',
    'VALORPADRAO',
  ];

  /**
   * Descrição da query para documentação.
   */
  readonly descricao = 'Lista todos os campos de uma tabela específica do dicionário';
}
