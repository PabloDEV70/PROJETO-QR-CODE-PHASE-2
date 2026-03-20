/**
 * Query para obter estatísticas do dicionário de dados.
 *
 * Retorna contagens e métricas sobre instâncias, tabelas,
 * campos e relacionamentos.
 *
 * @module Dicionario
 * @tabelas TDDINS, TDDCAM, TDDLIG
 */

/**
 * Parâmetros opcionais para filtrar estatísticas.
 */
export interface ObterEstatisticasParametros {
  /** Filtrar estatísticas por tabela específica */
  nomeTabela?: string;
  /** Incluir apenas entidades ativas */
  apenasAtivos?: boolean;
}

/**
 * Query para obter estatísticas agregadas do dicionário.
 *
 * Retorna contagens de instâncias, tabelas, campos e relacionamentos.
 *
 * @example
 * ```typescript
 * // Estatísticas gerais
 * const query = new ObterEstatisticasQuery();
 *
 * // Estatísticas de uma tabela específica
 * const query = new ObterEstatisticasQuery({ nomeTabela: 'TGFPRO' });
 * ```
 */
export class ObterEstatisticasQuery {
  constructor(private readonly params?: ObterEstatisticasParametros) {}

  /**
   * Obtém o SQL para estatísticas gerais.
   */
  get sql(): string {
    if (this.params?.nomeTabela) {
      return this.sqlPorTabela();
    }
    return this.sqlGeral();
  }

  /**
   * SQL para estatísticas gerais do dicionário.
   */
  private sqlGeral(): string {
    const filtroAtivo = this.params?.apenasAtivos ? "WHERE ATIVA = 'S'" : '';
    const filtroAtivoLig = this.params?.apenasAtivos ? "WHERE ATIVO = 'S'" : '';

    return `
      SELECT
        -- Contagem de instâncias
        (SELECT COUNT(*) FROM TDDINS ${filtroAtivo}) as totalInstancias,
        (SELECT COUNT(*) FROM TDDINS WHERE ATIVA = 'S') as instanciasAtivas,
        (SELECT COUNT(*) FROM TDDINS WHERE ATIVA = 'N') as instanciasInativas,

        -- Contagem de tabelas distintas
        (SELECT COUNT(DISTINCT NOMETAB) FROM TDDINS ${filtroAtivo}) as totalTabelas,

        -- Contagem de campos
        (SELECT COUNT(*) FROM TDDCAM) as totalCampos,
        (SELECT COUNT(DISTINCT NOMETAB) FROM TDDCAM) as tabelasComCampos,

        -- Contagem de relacionamentos
        (SELECT COUNT(*) FROM TDDLIG ${filtroAtivoLig}) as totalRelacionamentos,
        (SELECT COUNT(*) FROM TDDLIG WHERE ATIVO = 'S') as relacionamentosAtivos,

        -- Médias
        (SELECT AVG(CAST(cnt AS FLOAT)) FROM (
          SELECT COUNT(*) as cnt FROM TDDCAM GROUP BY NOMETAB
        ) t) as mediaCamposPorTabela,

        (SELECT AVG(CAST(cnt AS FLOAT)) FROM (
          SELECT COUNT(*) as cnt FROM TDDLIG GROUP BY NOMEINSTANCIAPAI
        ) t) as mediaFilhosPorInstancia
    `.trim();
  }

  /**
   * SQL para estatísticas de uma tabela específica.
   */
  private sqlPorTabela(): string {
    return `
      SELECT
        -- Informações da tabela
        @nomeTabela as nomeTabela,

        -- Instâncias da tabela
        (SELECT COUNT(*) FROM TDDINS WHERE NOMETAB = @nomeTabela) as totalInstancias,
        (SELECT COUNT(*) FROM TDDINS WHERE NOMETAB = @nomeTabela AND ATIVA = 'S') as instanciasAtivas,

        -- Campos da tabela
        (SELECT COUNT(*) FROM TDDCAM WHERE NOMETAB = @nomeTabela) as totalCampos,
        (SELECT COUNT(*) FROM TDDCAM WHERE NOMETAB = @nomeTabela AND CHAVE = 'S') as camposChave,
        (SELECT COUNT(*) FROM TDDCAM WHERE NOMETAB = @nomeTabela AND OBRIGATORIO = 'S') as camposObrigatorios,

        -- Relacionamentos das instâncias da tabela
        (SELECT COUNT(DISTINCT l.NOMEINSTANCIAFILHO)
         FROM TDDLIG l
         INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
         WHERE i.NOMETAB = @nomeTabela) as totalFilhos,

        (SELECT COUNT(DISTINCT l.NOMEINSTANCIAPAI)
         FROM TDDLIG l
         INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
         WHERE i.NOMETAB = @nomeTabela) as totalPais,

        -- Lista de instâncias
        (SELECT STRING_AGG(NOMEINSTANCIA, ', ') FROM TDDINS WHERE NOMETAB = @nomeTabela) as listaInstancias
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    if (this.params?.nomeTabela) {
      params.nomeTabela = this.params.nomeTabela.toUpperCase();
    }
    return params;
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS', 'TDDCAM', 'TDDLIG'];

  /** Descrição da query para documentação */
  readonly descricao = 'Obtém estatísticas agregadas do dicionário de dados';
}
