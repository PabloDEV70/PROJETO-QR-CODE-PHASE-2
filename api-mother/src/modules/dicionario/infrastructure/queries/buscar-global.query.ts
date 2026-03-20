/**
 * Query para busca global no dicionário de dados.
 *
 * Realiza busca em múltiplas tabelas usando UNION para
 * encontrar correspondências em instâncias, tabelas e campos.
 *
 * @module Dicionario
 * @tabelas TDDINS, TDDCAM
 */

/**
 * Parâmetros para busca global.
 */
export interface BuscarGlobalParametros {
  /** Termo de busca (parcial) */
  termo: string;
  /** Tipos de entidade para buscar */
  tipos?: ('instancia' | 'tabela' | 'campo')[];
  /** Limite de resultados por tipo */
  limitePorTipo?: number;
}

/**
 * Query para busca global no dicionário de dados.
 *
 * Busca em nomes e descrições de instâncias, tabelas e campos.
 *
 * @example
 * ```typescript
 * // Buscar em todas as entidades
 * const query = new BuscarGlobalQuery({ termo: 'produto' });
 *
 * // Buscar apenas em instâncias e campos
 * const query = new BuscarGlobalQuery({
 *   termo: 'cod',
 *   tipos: ['instancia', 'campo'],
 *   limitePorTipo: 10
 * });
 * ```
 */
export class BuscarGlobalQuery {
  constructor(private readonly params: BuscarGlobalParametros) {
    if (!params.termo || params.termo.trim().length < 2) {
      throw new Error('Termo de busca deve ter pelo menos 2 caracteres');
    }
  }

  /**
   * Obtém o SQL da query com UNION.
   */
  get sql(): string {
    const tipos = this.params.tipos || ['instancia', 'tabela', 'campo'];
    const limite = this.params.limitePorTipo || 50;
    const queries: string[] = [];

    if (tipos.includes('instancia')) {
      queries.push(`
        SELECT TOP ${limite}
          'INSTANCIA' as tipoResultado,
          NOMEINSTANCIA as identificador,
          NOMETAB as tabelaAssociada,
          DESCRICAO as descricao,
          CASE
            WHEN UPPER(NOMEINSTANCIA) LIKE UPPER(@termoExato) THEN 100
            WHEN UPPER(NOMEINSTANCIA) LIKE UPPER(@termoInicio) THEN 80
            WHEN UPPER(DESCRICAO) LIKE UPPER(@termoExato) THEN 70
            ELSE 50
          END as relevancia
        FROM TDDINS
        WHERE UPPER(NOMEINSTANCIA) LIKE UPPER(@termo)
           OR UPPER(DESCRICAO) LIKE UPPER(@termo)
           OR UPPER(NOMETAB) LIKE UPPER(@termo)
      `);
    }

    if (tipos.includes('tabela')) {
      queries.push(`
        SELECT TOP ${limite}
          'TABELA' as tipoResultado,
          NOMETAB as identificador,
          NULL as tabelaAssociada,
          DESCRTAB as descricao,
          CASE
            WHEN UPPER(NOMETAB) LIKE UPPER(@termoExato) THEN 100
            WHEN UPPER(NOMETAB) LIKE UPPER(@termoInicio) THEN 80
            WHEN UPPER(DESCRTAB) LIKE UPPER(@termoExato) THEN 70
            ELSE 50
          END as relevancia
        FROM (
          SELECT DISTINCT NOMETAB, DESCRTAB
          FROM TDDCAM
          WHERE UPPER(NOMETAB) LIKE UPPER(@termo)
             OR UPPER(DESCRTAB) LIKE UPPER(@termo)
        ) t
      `);
    }

    if (tipos.includes('campo')) {
      queries.push(`
        SELECT TOP ${limite}
          'CAMPO' as tipoResultado,
          NOMECAMPO as identificador,
          NOMETAB as tabelaAssociada,
          DESCRCAMPO as descricao,
          CASE
            WHEN UPPER(NOMECAMPO) LIKE UPPER(@termoExato) THEN 100
            WHEN UPPER(NOMECAMPO) LIKE UPPER(@termoInicio) THEN 80
            WHEN UPPER(DESCRCAMPO) LIKE UPPER(@termoExato) THEN 70
            ELSE 50
          END as relevancia
        FROM TDDCAM
        WHERE UPPER(NOMECAMPO) LIKE UPPER(@termo)
           OR UPPER(DESCRCAMPO) LIKE UPPER(@termo)
      `);
    }

    if (queries.length === 0) {
      throw new Error('Pelo menos um tipo de busca deve ser especificado');
    }

    return queries.join('\n\nUNION ALL\n\n') + '\n\nORDER BY relevancia DESC, tipoResultado, identificador';
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    const termoLimpo = this.params.termo.trim();
    return {
      termo: `%${termoLimpo}%`,
      termoExato: termoLimpo,
      termoInicio: `${termoLimpo}%`,
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS', 'TDDCAM'];

  /** Descrição da query para documentação */
  readonly descricao = 'Busca global em instâncias, tabelas e campos do dicionário';
}
