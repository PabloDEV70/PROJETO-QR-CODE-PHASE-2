import { Injectable, Logger } from '@nestjs/common';
import { ICacheMetadados, EstatisticasCache } from '../interfaces';

/**
 * Provider de cache em memória.
 *
 * Implementação simples usando Map do JavaScript.
 * Adequado para desenvolvimento e produção de pequeno porte.
 *
 * @module Dicionario/Cache
 */
@Injectable()
export class MemoryCacheProvider implements ICacheMetadados {
  private readonly logger = new Logger(MemoryCacheProvider.name);
  private readonly cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  /**
   * Obtém valor do cache.
   */
  async obter<T>(chave: string): Promise<T | null> {
    const entry = this.cache.get(chave);

    if (!entry) {
      this.misses++;
      this.logger.debug(`Cache miss: ${chave}`);
      return null;
    }

    // Verificar expiração
    if (entry.expiraEm && entry.expiraEm < Date.now()) {
      this.cache.delete(chave);
      this.misses++;
      this.logger.debug(`Cache expirado: ${chave}`);
      return null;
    }

    this.hits++;
    this.logger.debug(`Cache hit: ${chave}`);
    return entry.valor as T;
  }

  /**
   * Define valor no cache.
   */
  async definir<T>(chave: string, valor: T, ttl?: number): Promise<void> {
    const expiraEm = ttl ? Date.now() + ttl * 1000 : undefined;

    this.cache.set(chave, {
      valor,
      expiraEm,
      criadoEm: Date.now(),
    });

    this.logger.debug(`Cache definido: ${chave} (TTL: ${ttl || 'indefinido'}s)`);
  }

  /**
   * Remove valor do cache.
   */
  async remover(chave: string): Promise<void> {
    const removed = this.cache.delete(chave);
    if (removed) {
      this.logger.debug(`Cache removido: ${chave}`);
    }
  }

  /**
   * Remove todos os valores com prefixo.
   */
  async removerPorPrefixo(prefixo: string): Promise<void> {
    let count = 0;

    for (const chave of this.cache.keys()) {
      if (chave.startsWith(prefixo)) {
        this.cache.delete(chave);
        count++;
      }
    }

    this.logger.log(`Cache removido por prefixo "${prefixo}": ${count} entradas`);
  }

  /**
   * Limpa todo o cache.
   */
  async limpar(): Promise<void> {
    const tamanhoAnterior = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;

    this.logger.log(`Cache limpo: ${tamanhoAnterior} entradas removidas`);
  }

  /**
   * Verifica se chave existe no cache.
   */
  async existe(chave: string): Promise<boolean> {
    const entry = this.cache.get(chave);

    if (!entry) {
      return false;
    }

    // Verificar expiração
    if (entry.expiraEm && entry.expiraEm < Date.now()) {
      this.cache.delete(chave);
      return false;
    }

    return true;
  }

  /**
   * Obtém estatísticas do cache.
   */
  async obterEstatisticas(): Promise<EstatisticasCache> {
    // Limpar entradas expiradas antes de calcular
    await this.limparExpirados();

    const total = this.hits + this.misses;
    const taxaAcerto = total > 0 ? this.hits / total : 0;

    // Estimar uso de memória (aproximado)
    const usoMemoria = this.estimarUsoMemoria();

    return {
      totalChaves: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      taxaAcerto: Math.round(taxaAcerto * 10000) / 100, // Percentual com 2 decimais
      usoMemoria,
    };
  }

  /**
   * Limpa entradas expiradas.
   */
  private async limparExpirados(): Promise<void> {
    const agora = Date.now();
    let count = 0;

    for (const [chave, entry] of this.cache.entries()) {
      if (entry.expiraEm && entry.expiraEm < agora) {
        this.cache.delete(chave);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(`Entradas expiradas removidas: ${count}`);
    }
  }

  /**
   * Estima uso de memória (aproximado).
   */
  private estimarUsoMemoria(): number {
    let bytes = 0;

    for (const [chave, entry] of this.cache.entries()) {
      // Tamanho aproximado da chave
      bytes += chave.length * 2; // 2 bytes por caractere (UTF-16)

      // Tamanho aproximado do valor (JSON serializado)
      try {
        const json = JSON.stringify(entry.valor);
        bytes += json.length * 2;
      } catch {
        // Se não serializar, estimar 100 bytes
        bytes += 100;
      }

      // Overhead da entry (timestamps)
      bytes += 16; // 8 bytes por timestamp
    }

    return bytes;
  }
}

/**
 * Entrada do cache.
 */
interface CacheEntry<T> {
  valor: T;
  expiraEm?: number;
  criadoEm: number;
}
