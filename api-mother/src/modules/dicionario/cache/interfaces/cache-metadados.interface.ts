/**
 * Interface para cache de metadados do dicionário de dados.
 *
 * Define o contrato para providers de cache (memória, Redis, etc).
 *
 * @module Dicionario/Cache
 */
export interface ICacheMetadados {
  /**
   * Obtém valor do cache.
   *
   * @param chave - Chave do cache
   * @returns Valor armazenado ou null se não encontrado
   */
  obter<T>(chave: string): Promise<T | null>;

  /**
   * Define valor no cache.
   *
   * @param chave - Chave do cache
   * @param valor - Valor a ser armazenado
   * @param ttl - Tempo de vida em segundos (opcional)
   */
  definir<T>(chave: string, valor: T, ttl?: number): Promise<void>;

  /**
   * Remove valor do cache.
   *
   * @param chave - Chave a ser removida
   */
  remover(chave: string): Promise<void>;

  /**
   * Remove todos os valores com prefixo.
   *
   * @param prefixo - Prefixo das chaves a serem removidas
   */
  removerPorPrefixo(prefixo: string): Promise<void>;

  /**
   * Limpa todo o cache.
   */
  limpar(): Promise<void>;

  /**
   * Verifica se chave existe no cache.
   *
   * @param chave - Chave a ser verificada
   */
  existe(chave: string): Promise<boolean>;

  /**
   * Obtém estatísticas do cache.
   */
  obterEstatisticas(): Promise<EstatisticasCache>;
}

/**
 * Estatísticas do cache.
 */
export interface EstatisticasCache {
  /**
   * Total de chaves armazenadas.
   */
  totalChaves: number;

  /**
   * Total de hits (acessos com sucesso).
   */
  hits: number;

  /**
   * Total de misses (acessos sem sucesso).
   */
  misses: number;

  /**
   * Taxa de acerto (hits / (hits + misses)).
   */
  taxaAcerto: number;

  /**
   * Uso de memória em bytes (se aplicável).
   */
  usoMemoria?: number;
}

/**
 * Symbol para injeção de dependência.
 */
export const CACHE_METADADOS = Symbol('ICacheMetadados');
