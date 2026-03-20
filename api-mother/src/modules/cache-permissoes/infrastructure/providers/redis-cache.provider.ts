/**
 * RedisCacheProvider - Implementacao de cache com Redis.
 *
 * Provider opcional que usa Redis como backend de cache.
 * Faz fallback para MemoryCache se Redis nao estiver disponivel.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T04
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICacheProvider, OpcoesCacheSet, InfoChave } from '../../domain/repositories/cache-provider.interface';
import { MemoryCacheProvider } from './memory-cache.provider';

// Tipos para Redis (sem dependencia direta do pacote)
interface RedisClienteLike {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<unknown>;
  del(key: string | string[]): Promise<number>;
  exists(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  mget(keys: string[]): Promise<(string | null)[]>;
  flushdb(): Promise<void>;
  dbsize(): Promise<number>;
  isOpen: boolean;
  on(event: string, callback: (error?: Error) => void): void;
}

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Injectable()
export class RedisCacheProvider implements ICacheProvider, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheProvider.name);
  private redisDisponivel = false;

  // Configuracoes
  private readonly TTL_PADRAO = 300;
  private readonly PREFIXO = 'sankhya:cache:';

  constructor(
    private readonly memoryCacheFallback: MemoryCacheProvider,
    private readonly configService: ConfigService,
    @Optional() @Inject(REDIS_CLIENT) private readonly redisClient?: RedisClienteLike,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.tentarConectarRedis();
  }

  async onModuleDestroy(): Promise<void> {
    await this.desconectarRedis();
  }

  private async tentarConectarRedis(): Promise<void> {
    if (!this.redisClient) {
      this.logger.log('Redis client nao injetado, usando MemoryCache como fallback');
      return;
    }

    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }
      this.redisDisponivel = true;
      this.logger.log('Conectado ao Redis com sucesso');

      // Registrar handlers de erro
      this.redisClient.on('error', (error: Error) => {
        this.logger.error(`Erro no Redis: ${error.message}`);
        this.redisDisponivel = false;
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.warn('Redis reconectando...');
      });
    } catch (error) {
      this.logger.warn(`Falha ao conectar ao Redis: ${(error as Error).message}. Usando MemoryCache.`);
      this.redisDisponivel = false;
    }
  }

  private async desconectarRedis(): Promise<void> {
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        await this.redisClient.disconnect();
        this.logger.log('Desconectado do Redis');
      } catch (error) {
        this.logger.error(`Erro ao desconectar do Redis: ${(error as Error).message}`);
      }
    }
  }

  private chaveComPrefixo(chave: string): string {
    return `${this.PREFIXO}${chave}`;
  }

  private chavesSemPrefixo(chave: string): string {
    return chave.startsWith(this.PREFIXO) ? chave.slice(this.PREFIXO.length) : chave;
  }

  async get<T>(chave: string): Promise<T | null> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.get<T>(chave);
    }

    try {
      const valor = await this.redisClient!.get(this.chaveComPrefixo(chave));

      if (!valor) {
        return null;
      }

      return JSON.parse(valor) as T;
    } catch (error) {
      this.logger.error(`Erro ao buscar do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.get<T>(chave);
    }
  }

  async set<T>(chave: string, valor: T, opcoes?: OpcoesCacheSet): Promise<void> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.set(chave, valor, opcoes);
    }

    try {
      const ttl = opcoes?.ttlSegundos || this.TTL_PADRAO;
      const valorSerializado = JSON.stringify(valor);

      await this.redisClient!.set(this.chaveComPrefixo(chave), valorSerializado, {
        EX: ttl,
      });
    } catch (error) {
      this.logger.error(`Erro ao gravar no Redis: ${(error as Error).message}`);
      await this.memoryCacheFallback.set(chave, valor, opcoes);
    }
  }

  async delete(chave: string): Promise<boolean> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.delete(chave);
    }

    try {
      const resultado = await this.redisClient!.del(this.chaveComPrefixo(chave));
      return resultado > 0;
    } catch (error) {
      this.logger.error(`Erro ao deletar do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.delete(chave);
    }
  }

  async clear(): Promise<void> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.clear();
    }

    try {
      // Deletar apenas chaves com nosso prefixo
      const chaves = await this.redisClient!.keys(`${this.PREFIXO}*`);
      if (chaves.length > 0) {
        await this.redisClient!.del(chaves);
      }
      this.logger.log(`Cache Redis limpo: ${chaves.length} chaves removidas`);
    } catch (error) {
      this.logger.error(`Erro ao limpar Redis: ${(error as Error).message}`);
      await this.memoryCacheFallback.clear();
    }
  }

  async has(chave: string): Promise<boolean> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.has(chave);
    }

    try {
      const existe = await this.redisClient!.exists(this.chaveComPrefixo(chave));
      return existe > 0;
    } catch (error) {
      this.logger.error(`Erro ao verificar existencia no Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.has(chave);
    }
  }

  async keys(padrao?: string): Promise<string[]> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.keys(padrao);
    }

    try {
      const padraoRedis = padrao ? `${this.PREFIXO}${padrao}` : `${this.PREFIXO}*`;
      const chaves = await this.redisClient!.keys(padraoRedis);
      return chaves.map((c) => this.chavesSemPrefixo(c));
    } catch (error) {
      this.logger.error(`Erro ao listar chaves do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.keys(padrao);
    }
  }

  async getInfo(chave: string): Promise<InfoChave | null> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.getInfo(chave);
    }

    try {
      const chaveCompleta = this.chaveComPrefixo(chave);
      const [ttl, valor] = await Promise.all([
        this.redisClient!.ttl(chaveCompleta),
        this.redisClient!.get(chaveCompleta),
      ]);

      if (ttl < 0 || !valor) {
        return null;
      }

      return {
        chave,
        ttlRestante: ttl,
        criadoEm: new Date(), // Redis nao armazena criacao, aproximamos
        tamanho: valor.length,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter info do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.getInfo(chave);
    }
  }

  async size(): Promise<number> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.size();
    }

    try {
      const chaves = await this.redisClient!.keys(`${this.PREFIXO}*`);
      return chaves.length;
    } catch (error) {
      this.logger.error(`Erro ao obter tamanho do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.size();
    }
  }

  async touch(chave: string, ttlSegundos: number): Promise<boolean> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.touch(chave, ttlSegundos);
    }

    try {
      const resultado = await this.redisClient!.expire(this.chaveComPrefixo(chave), ttlSegundos);
      return resultado > 0;
    } catch (error) {
      this.logger.error(`Erro ao atualizar TTL no Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.touch(chave, ttlSegundos);
    }
  }

  async mget<T>(chaves: string[]): Promise<Map<string, T>> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.mget<T>(chaves);
    }

    try {
      const chavesCompletas = chaves.map((c) => this.chaveComPrefixo(c));
      const valores = await this.redisClient!.mget(chavesCompletas);

      const resultado = new Map<string, T>();
      valores.forEach((valor, index) => {
        if (valor) {
          resultado.set(chaves[index], JSON.parse(valor) as T);
        }
      });

      return resultado;
    } catch (error) {
      this.logger.error(`Erro ao buscar multiplos do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.mget<T>(chaves);
    }
  }

  async mset<T>(itens: Map<string, T>, opcoes?: OpcoesCacheSet): Promise<void> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.mset(itens, opcoes);
    }

    try {
      const promises = Array.from(itens.entries()).map(([chave, valor]) => this.set(chave, valor, opcoes));
      await Promise.all(promises);
    } catch (error) {
      this.logger.error(`Erro ao gravar multiplos no Redis: ${(error as Error).message}`);
      await this.memoryCacheFallback.mset(itens, opcoes);
    }
  }

  async mdelete(chaves: string[]): Promise<number> {
    if (!this.redisDisponivel) {
      return this.memoryCacheFallback.mdelete(chaves);
    }

    try {
      const chavesCompletas = chaves.map((c) => this.chaveComPrefixo(c));
      return await this.redisClient!.del(chavesCompletas);
    } catch (error) {
      this.logger.error(`Erro ao deletar multiplos do Redis: ${(error as Error).message}`);
      return this.memoryCacheFallback.mdelete(chaves);
    }
  }

  async deleteByPattern(padrao: string): Promise<number> {
    const chaves = await this.keys(padrao);
    if (chaves.length === 0) return 0;
    return this.mdelete(chaves);
  }

  // Metodos adicionais para diagnostico

  isRedisDisponivel(): boolean {
    return this.redisDisponivel;
  }

  getProviderAtivo(): string {
    return this.redisDisponivel ? 'Redis' : 'Memory';
  }
}
