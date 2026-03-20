/**
 * Query para busca global de campos no dicionário de dados (TDDCAM).
 *
 * Busca campos em todas as tabelas que contenham o termo
 * no nome do campo ou descrição.
 *
 * @module Dicionário
 * @tabelas TDDCAM
 * @task D2-T09
 */
export interface BuscarCamposParametros {
  termo: string;
  /** Limitar busca a uma tabela específica (opcional) */
  nomeTabela?: string;
}

export class BuscarCamposQuery {
  constructor(private readonly params: BuscarCamposParametros) {}

  /**
   * SQL da query.
   * Busca por LIKE em NOMECAMPO e DESCRICAO.
   * Opcionalmente filtra por tabela.
   */
  get sql(): string {
    const filtroTabela = this.params.nomeTabela ? 'AND NOMETAB = @param2' : '';

    return `
      SELECT TOP 100
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
      WHERE (
        NOMECAMPO LIKE @param1
        OR DESCRICAO LIKE @param1
      )
      ${filtroTabela}
      ORDER BY NOMETAB ASC, NOMECAMPO ASC
    `;
  }

  /**
   * Parâmetros da query.
   * Aplica wildcards para busca parcial.
   */
  get parametros(): string[] {
    const termoFormatado = `%${this.params.termo.toUpperCase()}%`;
    const params = [termoFormatado];

    if (this.params.nomeTabela) {
      params.push(this.params.nomeTabela.toUpperCase());
    }

    return params;
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
  readonly descricao = 'Busca campos por termo no nome ou descrição em todas as tabelas';
}
