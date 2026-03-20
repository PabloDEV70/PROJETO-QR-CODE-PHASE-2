/**
 * Query para obter campos de ligação entre instâncias (TDDLGC).
 *
 * A tabela TDDLGC armazena os mapeamentos de campos entre
 * instâncias pai e filho para JOINs.
 *
 * @module Dicionario
 * @tabela TDDLGC
 */

/**
 * Parâmetros para obter campos de link.
 */
export interface ObterCamposLinkParametros {
  /** Nome da instância pai */
  nomeInstanciaPai: string;
  /** Nome da instância filho */
  nomeInstanciaFilho: string;
}

/**
 * Query para obter os campos que ligam duas instâncias.
 *
 * Retorna o mapeamento campo origem -> campo destino usado para JOINs.
 *
 * @example
 * ```typescript
 * const query = new ObterCamposLinkQuery({
 *   nomeInstanciaPai: 'Pedido',
 *   nomeInstanciaFilho: 'ItemPedido'
 * });
 * // Retorna algo como:
 * // { campoOrigem: 'CODPED', campoDestino: 'CODPED' }
 * ```
 */
export class ObterCamposLinkQuery {
  constructor(private readonly params: ObterCamposLinkParametros) {
    if (!params.nomeInstanciaPai || params.nomeInstanciaPai.trim().length === 0) {
      throw new Error('Nome da instância pai é obrigatório');
    }
    if (!params.nomeInstanciaFilho || params.nomeInstanciaFilho.trim().length === 0) {
      throw new Error('Nome da instância filho é obrigatório');
    }
  }

  /**
   * Obtém o SQL da query.
   */
  get sql(): string {
    return `
      SELECT
        NOMEINSTANCIAPAI as nomeInstanciaPai,
        NOMEINSTANCIAFILHO as nomeInstanciaFilho,
        CAMPOORIGEM as campoOrigem,
        CAMPODESTINO as campoDestino,
        ORDEM as ordem
      FROM TDDLGC
      WHERE UPPER(NOMEINSTANCIAPAI) = UPPER(@nomeInstanciaPai)
        AND UPPER(NOMEINSTANCIAFILHO) = UPPER(@nomeInstanciaFilho)
      ORDER BY ORDEM
    `.trim();
  }

  /**
   * Obtém os parâmetros da query.
   */
  get parametros(): Record<string, unknown> {
    return {
      nomeInstanciaPai: this.params.nomeInstanciaPai.trim(),
      nomeInstanciaFilho: this.params.nomeInstanciaFilho.trim(),
    };
  }

  /** Tabelas consultadas pela query */
  readonly tabelas = ['TDDLGC'];

  /** Campos retornados pela query */
  readonly campos = ['NOMEINSTANCIAPAI', 'NOMEINSTANCIAFILHO', 'CAMPOORIGEM', 'CAMPODESTINO', 'ORDEM'];

  /** Descrição da query para documentação */
  readonly descricao = 'Busca campos de ligação entre duas instâncias';
}
