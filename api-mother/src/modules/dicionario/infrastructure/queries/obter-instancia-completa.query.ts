/**
 * Query para obter uma instância completa com seus links/relacionamentos.
 *
 * Realiza JOIN entre TDDINS e TDDLIG para trazer a instância
 * junto com seus relacionamentos (filhos e pais).
 *
 * @module Dicionario
 * @tabelas TDDINS, TDDLIG
 */

/**
 * Parâmetros para obter instância completa.
 */
export interface ObterInstanciaCompletaParametros {
  /** Nome da instância a buscar */
  nomeInstancia: string;
  /** Incluir relacionamentos onde a instância é pai */
  incluirFilhos?: boolean;
  /** Incluir relacionamentos onde a instância é filho */
  incluirPais?: boolean;
}

/**
 * Query para obter instância com seus relacionamentos.
 *
 * Retorna a instância e seus vínculos de pai/filho definidos em TDDLIG.
 *
 * @example
 * ```typescript
 * const query = new ObterInstanciaCompletaQuery({
 *   nomeInstancia: 'Produto',
 *   incluirFilhos: true,
 *   incluirPais: true
 * });
 * ```
 */
export class ObterInstanciaCompletaQuery {
  constructor(private readonly params: ObterInstanciaCompletaParametros) {
    if (!params.nomeInstancia || params.nomeInstancia.trim().length === 0) {
      throw new Error('Nome da instância é obrigatório');
    }
  }

  /**
   * Obtém o SQL da query principal (instância).
   */
  get sqlInstancia(): string {
    return `
      SELECT
        NOMEINSTANCIA as nomeInstancia,
        NOMETAB as nomeTabela,
        DESCRICAO as descricao,
        ORDEM as ordem,
        ATIVA as ativa
      FROM TDDINS
      WHERE UPPER(NOMEINSTANCIA) = UPPER(@nomeInstancia)
    `.trim();
  }

  /**
   * Obtém o SQL para buscar relacionamentos onde a instância é pai.
   */
  get sqlFilhos(): string {
    return `
      SELECT
        l.NOMEINSTANCIAPAI as nomeInstanciaPai,
        l.NOMEINSTANCIAFILHO as nomeInstanciaFilho,
        l.TIPOLIGACAO as tipoLigacao,
        l.ORDEM as ordem,
        l.ATIVO as ativo,
        i.NOMETAB as tabelaFilho,
        i.DESCRICAO as descricaoFilho
      FROM TDDLIG l
      INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
      WHERE UPPER(l.NOMEINSTANCIAPAI) = UPPER(@nomeInstancia)
      ORDER BY l.ORDEM
    `.trim();
  }

  /**
   * Obtém o SQL para buscar relacionamentos onde a instância é filho.
   */
  get sqlPais(): string {
    return `
      SELECT
        l.NOMEINSTANCIAPAI as nomeInstanciaPai,
        l.NOMEINSTANCIAFILHO as nomeInstanciaFilho,
        l.TIPOLIGACAO as tipoLigacao,
        l.ORDEM as ordem,
        l.ATIVO as ativo,
        i.NOMETAB as tabelaPai,
        i.DESCRICAO as descricaoPai
      FROM TDDLIG l
      INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
      WHERE UPPER(l.NOMEINSTANCIAFILHO) = UPPER(@nomeInstancia)
      ORDER BY l.ORDEM
    `.trim();
  }

  /**
   * Obtém SQL combinado usando UNION para uma única execução.
   * Útil quando precisa de todos os dados em uma query.
   */
  get sql(): string {
    const queries: string[] = [];

    // Sempre inclui a instância principal
    queries.push(`
      SELECT
        'INSTANCIA' as tipo,
        NOMEINSTANCIA as nome,
        NOMETAB as tabela,
        DESCRICAO as descricao,
        ORDEM as ordem,
        ATIVA as ativo,
        NULL as tipoLigacao,
        NULL as nomeRelacionado,
        NULL as tabelaRelacionada
      FROM TDDINS
      WHERE UPPER(NOMEINSTANCIA) = UPPER(@nomeInstancia)
    `);

    // Adiciona filhos se solicitado
    if (this.params.incluirFilhos !== false) {
      queries.push(`
        SELECT
          'FILHO' as tipo,
          l.NOMEINSTANCIAFILHO as nome,
          i.NOMETAB as tabela,
          i.DESCRICAO as descricao,
          l.ORDEM as ordem,
          l.ATIVO as ativo,
          l.TIPOLIGACAO as tipoLigacao,
          l.NOMEINSTANCIAPAI as nomeRelacionado,
          NULL as tabelaRelacionada
        FROM TDDLIG l
        INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
        WHERE UPPER(l.NOMEINSTANCIAPAI) = UPPER(@nomeInstancia)
      `);
    }

    // Adiciona pais se solicitado
    if (this.params.incluirPais !== false) {
      queries.push(`
        SELECT
          'PAI' as tipo,
          l.NOMEINSTANCIAPAI as nome,
          i.NOMETAB as tabela,
          i.DESCRICAO as descricao,
          l.ORDEM as ordem,
          l.ATIVO as ativo,
          l.TIPOLIGACAO as tipoLigacao,
          l.NOMEINSTANCIAFILHO as nomeRelacionado,
          NULL as tabelaRelacionada
        FROM TDDLIG l
        INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
        WHERE UPPER(l.NOMEINSTANCIAFILHO) = UPPER(@nomeInstancia)
      `);
    }

    return queries.join('\n\nUNION ALL\n\n').trim() + '\n\nORDER BY tipo, ordem';
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    return {
      nomeInstancia: this.params.nomeInstancia.trim(),
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS', 'TDDLIG'];

  /** Descrição da query para documentação */
  readonly descricao = 'Busca instância completa com relacionamentos pai/filho';
}
