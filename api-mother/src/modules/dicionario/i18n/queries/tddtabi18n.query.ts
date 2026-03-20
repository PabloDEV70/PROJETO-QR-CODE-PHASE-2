/**
 * Query para buscar traduções de tabelas (TDDTABI18N).
 *
 * @module Dicionario/I18n
 */
export class TddTabI18nQuery {
  /**
   * SQL para buscar traduções de uma tabela.
   */
  static readonly BUSCAR_TRADUCOES_TABELA = `
    SELECT
      t.NOMETAB,
      t.IDIOMA,
      t.DESCRICAO as DESCRICAO_TRADUZIDA
    FROM TDDTABI18N t
    WHERE t.NOMETAB = :nomeTabela
  `;

  /**
   * SQL para buscar tradução específica por idioma.
   */
  static readonly BUSCAR_TRADUCAO_POR_IDIOMA = `
    SELECT
      t.NOMETAB,
      t.IDIOMA,
      t.DESCRICAO as DESCRICAO_TRADUZIDA
    FROM TDDTABI18N t
    WHERE t.NOMETAB = :nomeTabela
      AND t.IDIOMA = :idioma
  `;

  /**
   * SQL para buscar idiomas disponíveis para uma tabela.
   */
  static readonly BUSCAR_IDIOMAS_DISPONIVEIS = `
    SELECT DISTINCT
      t.IDIOMA
    FROM TDDTABI18N t
    WHERE t.NOMETAB = :nomeTabela
    ORDER BY t.IDIOMA
  `;
}
