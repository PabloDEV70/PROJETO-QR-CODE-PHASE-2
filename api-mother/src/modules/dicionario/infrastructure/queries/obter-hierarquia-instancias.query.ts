/**
 * Query recursiva para obter hierarquia de instâncias.
 *
 * Utiliza CTE (Common Table Expression) recursiva para
 * navegar pela árvore de relacionamentos.
 *
 * @module Dicionario
 * @tabelas TDDINS, TDDLIG
 */

/**
 * Parâmetros para obter hierarquia de instâncias.
 */
export interface ObterHierarquiaInstanciasParametros {
  /** Nome da instância raiz */
  nomeInstanciaRaiz: string;
  /** Direção da navegação: 'filhos' ou 'pais' */
  direcao: 'filhos' | 'pais';
  /** Profundidade máxima (default: 10) */
  profundidadeMaxima?: number;
  /** Filtrar apenas relacionamentos ativos */
  apenasAtivos?: boolean;
}

/**
 * Query para obter árvore hierárquica de instâncias.
 *
 * Navega recursivamente pelos relacionamentos para
 * construir a árvore de dependências.
 *
 * @example
 * ```typescript
 * // Obter todos os filhos de uma instância (árvore descendente)
 * const query = new ObterHierarquiaInstanciasQuery({
 *   nomeInstanciaRaiz: 'Pedido',
 *   direcao: 'filhos',
 *   profundidadeMaxima: 5
 * });
 *
 * // Obter todos os pais de uma instância (árvore ascendente)
 * const query = new ObterHierarquiaInstanciasQuery({
 *   nomeInstanciaRaiz: 'ItemPedido',
 *   direcao: 'pais'
 * });
 * ```
 */
export class ObterHierarquiaInstanciasQuery {
  constructor(private readonly params: ObterHierarquiaInstanciasParametros) {
    if (!params.nomeInstanciaRaiz || params.nomeInstanciaRaiz.trim().length === 0) {
      throw new Error('Nome da instância raiz é obrigatório');
    }
    if (!['filhos', 'pais'].includes(params.direcao)) {
      throw new Error("Direção deve ser 'filhos' ou 'pais'");
    }
  }

  /**
   * Obtém o SQL da query recursiva.
   */
  get sql(): string {
    const profundidade = this.params.profundidadeMaxima || 10;
    const filtroAtivo = this.params.apenasAtivos ? "AND l.ATIVO = 'S'" : '';

    if (this.params.direcao === 'filhos') {
      return this.sqlFilhos(profundidade, filtroAtivo);
    }
    return this.sqlPais(profundidade, filtroAtivo);
  }

  /**
   * SQL para navegar descendentemente (filhos).
   */
  private sqlFilhos(profundidade: number, filtroAtivo: string): string {
    return `
      WITH Hierarquia AS (
        -- Caso base: instância raiz
        SELECT
          i.NOMEINSTANCIA as nomeInstancia,
          i.NOMETAB as nomeTabela,
          i.DESCRICAO as descricao,
          i.ORDEM as ordemInstancia,
          i.ATIVA as ativa,
          CAST(NULL AS VARCHAR(255)) as nomeInstanciaPai,
          CAST(NULL AS VARCHAR(50)) as tipoLigacao,
          0 as nivel,
          CAST(i.NOMEINSTANCIA AS VARCHAR(4000)) as caminho
        FROM TDDINS i
        WHERE UPPER(i.NOMEINSTANCIA) = UPPER(@nomeInstanciaRaiz)

        UNION ALL

        -- Caso recursivo: filhos
        SELECT
          i.NOMEINSTANCIA,
          i.NOMETAB,
          i.DESCRICAO,
          i.ORDEM,
          i.ATIVA,
          l.NOMEINSTANCIAPAI,
          l.TIPOLIGACAO,
          h.nivel + 1,
          CAST(h.caminho + ' -> ' + i.NOMEINSTANCIA AS VARCHAR(4000))
        FROM TDDLIG l
        INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAFILHO
        INNER JOIN Hierarquia h ON h.nomeInstancia = l.NOMEINSTANCIAPAI
        WHERE h.nivel < ${profundidade}
          ${filtroAtivo}
      )
      SELECT
        nomeInstancia,
        nomeTabela,
        descricao,
        ordemInstancia as ordem,
        ativa,
        nomeInstanciaPai,
        tipoLigacao,
        nivel,
        caminho
      FROM Hierarquia
      ORDER BY nivel, ordemInstancia
    `.trim();
  }

  /**
   * SQL para navegar ascendentemente (pais).
   */
  private sqlPais(profundidade: number, filtroAtivo: string): string {
    return `
      WITH Hierarquia AS (
        -- Caso base: instância raiz
        SELECT
          i.NOMEINSTANCIA as nomeInstancia,
          i.NOMETAB as nomeTabela,
          i.DESCRICAO as descricao,
          i.ORDEM as ordemInstancia,
          i.ATIVA as ativa,
          CAST(NULL AS VARCHAR(255)) as nomeInstanciaFilho,
          CAST(NULL AS VARCHAR(50)) as tipoLigacao,
          0 as nivel,
          CAST(i.NOMEINSTANCIA AS VARCHAR(4000)) as caminho
        FROM TDDINS i
        WHERE UPPER(i.NOMEINSTANCIA) = UPPER(@nomeInstanciaRaiz)

        UNION ALL

        -- Caso recursivo: pais
        SELECT
          i.NOMEINSTANCIA,
          i.NOMETAB,
          i.DESCRICAO,
          i.ORDEM,
          i.ATIVA,
          l.NOMEINSTANCIAFILHO,
          l.TIPOLIGACAO,
          h.nivel + 1,
          CAST(i.NOMEINSTANCIA + ' -> ' + h.caminho AS VARCHAR(4000))
        FROM TDDLIG l
        INNER JOIN TDDINS i ON i.NOMEINSTANCIA = l.NOMEINSTANCIAPAI
        INNER JOIN Hierarquia h ON h.nomeInstancia = l.NOMEINSTANCIAFILHO
        WHERE h.nivel < ${profundidade}
          ${filtroAtivo}
      )
      SELECT
        nomeInstancia,
        nomeTabela,
        descricao,
        ordemInstancia as ordem,
        ativa,
        nomeInstanciaFilho,
        tipoLigacao,
        nivel,
        caminho
      FROM Hierarquia
      ORDER BY nivel, ordemInstancia
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    return {
      nomeInstanciaRaiz: this.params.nomeInstanciaRaiz.trim(),
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDINS', 'TDDLIG'];

  /** Descrição da query para documentação */
  readonly descricao = `Busca hierarquia de instâncias navegando por ${this.params.direcao}`;
}
