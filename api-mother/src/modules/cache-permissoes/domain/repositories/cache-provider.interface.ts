/**
 * Interface ICacheProvider - Contrato para provedores de cache.
 *
 * Define as operacoes basicas que qualquer provedor de cache
 * deve implementar (Memory, Redis, etc).
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T02
 */

export interface OpcoesCacheSet {
  ttlSegundos?: number;
  metadata?: Record<string, unknown>;
}

export interface InfoChave {
  chave: string;
  ttlRestante: number;
  criadoEm: Date;
  tamanho?: number;
}

export const CACHE_PROVIDER = Symbol('ICacheProvider');

export interface ICacheProvider {
  /**
   * Obtem um valor do cache.
   *
   * @param chave - Chave do item no cache
   * @returns O valor armazenado ou null se nao encontrado/expirado
   */
  get<T>(chave: string): Promise<T | null>;

  /**
   * Armazena um valor no cache.
   *
   * @param chave - Chave para armazenar o item
   * @param valor - Valor a ser armazenado
   * @param opcoes - Opcoes de armazenamento (TTL, metadata)
   */
  set<T>(chave: string, valor: T, opcoes?: OpcoesCacheSet): Promise<void>;

  /**
   * Remove um item do cache.
   *
   * @param chave - Chave do item a ser removido
   * @returns true se o item foi removido, false se nao existia
   */
  delete(chave: string): Promise<boolean>;

  /**
   * Remove todos os itens do cache.
   */
  clear(): Promise<void>;

  /**
   * Verifica se uma chave existe no cache (e nao esta expirada).
   *
   * @param chave - Chave a ser verificada
   * @returns true se a chave existe e esta valida
   */
  has(chave: string): Promise<boolean>;

  /**
   * Lista todas as chaves no cache (opcional: filtrar por padrao).
   *
   * @param padrao - Padrao para filtrar chaves (ex: "cache:permissao:*")
   * @returns Array de chaves que correspondem ao padrao
   */
  keys(padrao?: string): Promise<string[]>;

  /**
   * Obtem informacoes sobre uma chave.
   *
   * @param chave - Chave a ser consultada
   * @returns Informacoes da chave ou null se nao existir
   */
  getInfo(chave: string): Promise<InfoChave | null>;

  /**
   * Obtem o tamanho atual do cache (numero de itens).
   */
  size(): Promise<number>;

  /**
   * Atualiza o TTL de uma chave existente.
   *
   * @param chave - Chave a ser atualizada
   * @param ttlSegundos - Novo TTL em segundos
   * @returns true se a chave foi atualizada, false se nao existia
   */
  touch(chave: string, ttlSegundos: number): Promise<boolean>;

  /**
   * Obtem multiplos valores de uma vez.
   *
   * @param chaves - Array de chaves
   * @returns Map com os valores encontrados
   */
  mget<T>(chaves: string[]): Promise<Map<string, T>>;

  /**
   * Armazena multiplos valores de uma vez.
   *
   * @param itens - Map de chave -> valor
   * @param opcoes - Opcoes de armazenamento
   */
  mset<T>(itens: Map<string, T>, opcoes?: OpcoesCacheSet): Promise<void>;

  /**
   * Remove multiplas chaves de uma vez.
   *
   * @param chaves - Array de chaves a remover
   * @returns Numero de chaves removidas
   */
  mdelete(chaves: string[]): Promise<number>;

  /**
   * Remove todas as chaves que correspondem a um padrao.
   *
   * @param padrao - Padrao para filtrar chaves
   * @returns Numero de chaves removidas
   */
  deleteByPattern(padrao: string): Promise<number>;
}
