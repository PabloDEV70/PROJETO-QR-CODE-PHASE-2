/**
 * Query para obter campo específico do dicionário de dados (TDDCAM).
 *
 * Busca um campo pelo nome da tabela e nome do campo.
 *
 * @module Dicionário
 * @tabelas TDDCAM
 * @task D2-T06
 */
export interface ObterCampoParametros {
  nomeTabela: string;
  nomeCampo: string;
}

export class ObterCampoQuery {
  constructor(private readonly params: ObterCampoParametros) {}

  /**
   * SQL da query.
   * Busca campo específico por tabela e nome.
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
        AND NOMECAMPO = @param2
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
  readonly descricao = 'Obtém campo específico do dicionário por tabela e nome';
}
