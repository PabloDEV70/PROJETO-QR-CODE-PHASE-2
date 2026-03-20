/**
 * Query para buscar traduções de campos (TDDCAMI18N).
 *
 * @module Dicionario/I18n
 */
export class TddCamI18nQuery {
  /**
   * SQL para buscar traduções de um campo.
   */
  static readonly BUSCAR_TRADUCOES_CAMPO = `
    SELECT
      c.NOMETAB,
      c.NOMECAM,
      c.IDIOMA,
      c.DESCRICAO as DESCRICAO_TRADUZIDA,
      c.DESCRRESUMIDA as DESCRICAO_RESUMIDA_TRADUZIDA
    FROM TDDCAMI18N c
    WHERE c.NOMETAB = :nomeTabela
      AND c.NOMECAM = :nomeCampo
  `;

  /**
   * SQL para buscar tradução específica por idioma.
   */
  static readonly BUSCAR_TRADUCAO_POR_IDIOMA = `
    SELECT
      c.NOMETAB,
      c.NOMECAM,
      c.IDIOMA,
      c.DESCRICAO as DESCRICAO_TRADUZIDA,
      c.DESCRRESUMIDA as DESCRICAO_RESUMIDA_TRADUZIDA
    FROM TDDCAMI18N c
    WHERE c.NOMETAB = :nomeTabela
      AND c.NOMECAM = :nomeCampo
      AND c.IDIOMA = :idioma
  `;

  /**
   * SQL para buscar traduções de todos os campos de uma tabela.
   */
  static readonly BUSCAR_TRADUCOES_CAMPOS_TABELA = `
    SELECT
      c.NOMETAB,
      c.NOMECAM,
      c.IDIOMA,
      c.DESCRICAO as DESCRICAO_TRADUZIDA,
      c.DESCRRESUMIDA as DESCRICAO_RESUMIDA_TRADUZIDA
    FROM TDDCAMI18N c
    WHERE c.NOMETAB = :nomeTabela
      AND c.IDIOMA = :idioma
    ORDER BY c.NOMECAM
  `;
}
