/**
 * Query para obter grafo de tabelas relacionadas.
 *
 * Constrói um grafo de relacionamentos entre tabelas
 * através das instâncias definidas em TDDLIG.
 *
 * @module Dicionario
 * @tabelas TDDINS, TDDLIG
 */

/**
 * Parâmetros para obter tabelas relacionadas.
 */
export interface ObterTabelasRelacionadasParametros {
  /** Nome da tabela origem */
  nomeTabela: string;
  /** Profundidade máxima de navegação (default: 2) */
  profundidade?: number;
  /** Incluir apenas relacionamentos ativos */
  apenasAtivos?: boolean;
}

/**
 * Query para construir grafo de tabelas relacionadas.
 *
 * Navega pelos relacionamentos entre instâncias e agrupa
 * por tabela para criar um grafo de dependências.
 *
 * @example
 * ```typescript
 * // Obter tabelas relacionadas diretamente
 * const query = new ObterTabelasRelacionadasQuery({
 *   nomeTabela: 'TGFPRO',
 *   profundidade: 1
 * });
 *
 * // Obter grafo completo (2 níveis)
 * const query = new ObterTabelasRelacionadasQuery({
 *   nomeTabela: 'TGFPRO',
 *   profundidade: 2
 * });
 * ```
 */
export class ObterTabelasRelacionadasQuery {
  constructor(private readonly params: ObterTabelasRelacionadasParametros) {
    if (!params.nomeTabela || params.nomeTabela.trim().length === 0) {
      throw new Error('Nome da tabela é obrigatório');
    }
  }

  /**
   * Obtém o SQL da query.
   */
  get sql(): string {
    const profundidade = this.params.profundidade || 2;
    const filtroAtivo = this.params.apenasAtivos ? "AND l.ATIVO = 'S'" : '';

    return `
      WITH GrafoTabelas AS (
        -- Nível 0: tabela origem
        SELECT DISTINCT
          NOMETAB as tabela,
          0 as nivel,
          CAST(NOMETAB AS VARCHAR(4000)) as caminho
        FROM TDDINS
        WHERE NOMETAB = @nomeTabela

        UNION ALL

        -- Navegação: tabelas relacionadas via filhos
        SELECT DISTINCT
          iFilho.NOMETAB,
          g.nivel + 1,
          CAST(g.caminho + ' -> ' + iFilho.NOMETAB AS VARCHAR(4000))
        FROM GrafoTabelas g
        INNER JOIN TDDINS iPai ON iPai.NOMETAB = g.tabela
        INNER JOIN TDDLIG l ON l.NOMEINSTANCIAPAI = iPai.NOMEINSTANCIA
        INNER JOIN TDDINS iFilho ON iFilho.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
        WHERE g.nivel < ${profundidade}
          AND iFilho.NOMETAB <> g.tabela
          AND CHARINDEX(iFilho.NOMETAB, g.caminho) = 0  -- Evita ciclos
          ${filtroAtivo}

        UNION ALL

        -- Navegação: tabelas relacionadas via pais
        SELECT DISTINCT
          iPai.NOMETAB,
          g.nivel + 1,
          CAST(g.caminho + ' <- ' + iPai.NOMETAB AS VARCHAR(4000))
        FROM GrafoTabelas g
        INNER JOIN TDDINS iFilho ON iFilho.NOMETAB = g.tabela
        INNER JOIN TDDLIG l ON l.NOMEINSTANCIAFILHO = iFilho.NOMEINSTANCIA
        INNER JOIN TDDINS iPai ON iPai.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
        WHERE g.nivel < ${profundidade}
          AND iPai.NOMETAB <> g.tabela
          AND CHARINDEX(iPai.NOMETAB, g.caminho) = 0  -- Evita ciclos
          ${filtroAtivo}
      )
      -- Resultado final: tabelas únicas com menor nível
      SELECT
        tabela as nomeTabela,
        MIN(nivel) as nivelMinimo,
        COUNT(*) as quantidadeCaminhos,
        -- Informações adicionais da tabela
        (SELECT COUNT(*) FROM TDDINS WHERE NOMETAB = g.tabela) as quantidadeInstancias,
        (SELECT COUNT(*) FROM TDDCAM WHERE NOMETAB = g.tabela) as quantidadeCampos
      FROM GrafoTabelas g
      GROUP BY tabela
      ORDER BY nivelMinimo, tabela
    `.trim();
  }

  /**
   * SQL alternativo que retorna detalhes de relacionamentos.
   */
  get sqlDetalhado(): string {
    const filtroAtivo = this.params.apenasAtivos ? "AND l.ATIVO = 'S'" : '';

    return `
      SELECT DISTINCT
        iPai.NOMETAB as tabelaOrigem,
        iFilho.NOMETAB as tabelaDestino,
        l.TIPOLIGACAO as tipoLigacao,
        'FILHO' as direcao,
        (SELECT COUNT(*) FROM TDDLGC c
         WHERE c.NOMEINSTANCIAPAI = l.NOMEINSTANCIAPAI
           AND c.NOMEINSTANCIAFILHO = l.NOMEINSTANCIAFILHO) as quantidadeCamposLink
      FROM TDDINS iPai
      INNER JOIN TDDLIG l ON l.NOMEINSTANCIAPAI = iPai.NOMEINSTANCIA
      INNER JOIN TDDINS iFilho ON iFilho.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
      WHERE iPai.NOMETAB = @nomeTabela
        ${filtroAtivo}

      UNION

      SELECT DISTINCT
        iFilho.NOMETAB as tabelaOrigem,
        iPai.NOMETAB as tabelaDestino,
        l.TIPOLIGACAO as tipoLigacao,
        'PAI' as direcao,
        (SELECT COUNT(*) FROM TDDLGC c
         WHERE c.NOMEINSTANCIAPAI = l.NOMEINSTANCIAPAI
           AND c.NOMEINSTANCIAFILHO = l.NOMEINSTANCIAFILHO) as quantidadeCamposLink
      FROM TDDINS iFilho
      INNER JOIN TDDLIG l ON l.NOMEINSTANCIAFILHO = iFilho.NOMEINSTANCIA
      INNER JOIN TDDINS iPai ON iPai.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
      WHERE iFilho.NOMETAB = @nomeTabela
        ${filtroAtivo}

      ORDER BY direcao, tabelaDestino
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    return {
      nomeTabela: this.params.nomeTabela.toUpperCase().trim(),
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS', 'TDDLIG', 'TDDLGC'];

  /** Descrição da query para documentação */
  readonly descricao = 'Constrói grafo de tabelas relacionadas a partir de uma tabela origem';
}
