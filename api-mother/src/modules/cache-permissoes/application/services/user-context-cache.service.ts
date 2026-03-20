/**
 * UserContextCacheService - Servico de cache de contexto do usuario.
 *
 * Gerencia o cache de informacoes do usuario que sao frequentemente
 * consultadas durante verificacao de permissoes.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T06
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_PROVIDER, ICacheProvider } from '../../domain/repositories/cache-provider.interface';
import { ContextoUsuarioCache, DadosContextoUsuario } from '../../domain/entities/contexto-usuario-cache.entity';
import { ChaveCache } from '../../domain/value-objects/chave-cache.vo';
import { TtlCache } from '../../domain/value-objects/ttl-cache.vo';

export interface ResultadoContextoCache {
  encontrado: boolean;
  contexto?: ContextoUsuarioCache;
  fonte: 'cache' | 'banco';
}

@Injectable()
export class UserContextCacheService {
  private readonly logger = new Logger(UserContextCacheService.name);
  private readonly ttlPadrao = TtlCache.longo(); // 15 minutos

  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: ICacheProvider,
  ) {}

  /**
   * Busca o contexto de um usuario no cache.
   */
  async buscarContexto(codUsuario: number): Promise<ResultadoContextoCache> {
    const chave = ChaveCache.criarParaContexto(codUsuario);

    try {
      const dadosCacheados = await this.cacheProvider.get<DadosContextoUsuario>(chave.valor);

      if (dadosCacheados) {
        const contexto = ContextoUsuarioCache.criar(dadosCacheados);
        this.logger.debug(`Cache HIT: contexto usuario ${codUsuario}`);
        return {
          encontrado: true,
          contexto,
          fonte: 'cache',
        };
      }

      this.logger.debug(`Cache MISS: contexto usuario ${codUsuario}`);
      return {
        encontrado: false,
        fonte: 'banco',
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar contexto do cache: ${(error as Error).message}`);
      return {
        encontrado: false,
        fonte: 'banco',
      };
    }
  }

  /**
   * Armazena o contexto de um usuario no cache.
   */
  async armazenarContexto(contexto: ContextoUsuarioCache, ttl?: TtlCache): Promise<void> {
    const chave = ChaveCache.criarParaContexto(contexto.codUsuario);

    try {
      const ttlFinal = ttl || this.ttlPadrao;

      await this.cacheProvider.set(chave.valor, contexto.toJSON(), {
        ttlSegundos: ttlFinal.segundos,
        metadata: {
          tipo: 'contexto',
          nomeUsuario: contexto.nomeUsuario,
        },
      });

      this.logger.debug(`Contexto armazenado em cache: usuario ${contexto.codUsuario} (TTL: ${ttlFinal})`);
    } catch (error) {
      this.logger.error(`Erro ao armazenar contexto no cache: ${(error as Error).message}`);
    }
  }

  /**
   * Invalida o contexto de um usuario.
   */
  async invalidarContexto(codUsuario: number): Promise<boolean> {
    const chave = ChaveCache.criarParaContexto(codUsuario);

    try {
      const removido = await this.cacheProvider.delete(chave.valor);
      if (removido) {
        this.logger.log(`Contexto invalidado para usuario ${codUsuario}`);
      }
      return removido;
    } catch (error) {
      this.logger.error(`Erro ao invalidar contexto: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Atualiza o TTL do contexto sem recarregar dados.
   */
  async renovarContexto(codUsuario: number, ttl?: TtlCache): Promise<boolean> {
    const chave = ChaveCache.criarParaContexto(codUsuario);
    const ttlFinal = ttl || this.ttlPadrao;

    try {
      const renovado = await this.cacheProvider.touch(chave.valor, ttlFinal.segundos);
      if (renovado) {
        this.logger.debug(`TTL renovado para contexto usuario ${codUsuario}`);
      }
      return renovado;
    } catch (error) {
      this.logger.error(`Erro ao renovar contexto: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Busca parametro especifico do usuario no cache.
   */
  async buscarParametro(codUsuario: number, nomeParametro: string): Promise<unknown | null> {
    const chave = ChaveCache.criarParaParametro(codUsuario, nomeParametro);

    try {
      return await this.cacheProvider.get(chave.valor);
    } catch (error) {
      this.logger.error(`Erro ao buscar parametro do cache: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Armazena parametro especifico do usuario no cache.
   */
  async armazenarParametro(codUsuario: number, nomeParametro: string, valor: unknown, ttl?: TtlCache): Promise<void> {
    const chave = ChaveCache.criarParaParametro(codUsuario, nomeParametro);

    try {
      const ttlFinal = ttl || this.ttlPadrao;

      await this.cacheProvider.set(chave.valor, valor, {
        ttlSegundos: ttlFinal.segundos,
      });
    } catch (error) {
      this.logger.error(`Erro ao armazenar parametro: ${(error as Error).message}`);
    }
  }

  /**
   * Invalida todos os parametros de um usuario.
   */
  async invalidarParametrosUsuario(codUsuario: number): Promise<number> {
    const padrao = `cache:parametro:user:${codUsuario}:*`;

    try {
      const removidos = await this.cacheProvider.deleteByPattern(padrao);
      this.logger.log(`Parametros invalidados para usuario ${codUsuario}: ${removidos} entradas`);
      return removidos;
    } catch (error) {
      this.logger.error(`Erro ao invalidar parametros: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Busca contextos de multiplos usuarios.
   */
  async buscarContextosEmLote(codUsuarios: number[]): Promise<Map<number, ResultadoContextoCache>> {
    const chaves = codUsuarios.map((cod) => ChaveCache.criarParaContexto(cod));
    const chavesStr = chaves.map((c) => c.valor);
    const resultados = new Map<number, ResultadoContextoCache>();

    try {
      const dadosCacheados = await this.cacheProvider.mget<DadosContextoUsuario>(chavesStr);

      codUsuarios.forEach((codUsuario, index) => {
        const chave = chaves[index];
        const dados = dadosCacheados.get(chave.valor);

        if (dados) {
          resultados.set(codUsuario, {
            encontrado: true,
            contexto: ContextoUsuarioCache.criar(dados),
            fonte: 'cache',
          });
        } else {
          resultados.set(codUsuario, {
            encontrado: false,
            fonte: 'banco',
          });
        }
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar contextos em lote: ${(error as Error).message}`);
      codUsuarios.forEach((codUsuario) => {
        resultados.set(codUsuario, {
          encontrado: false,
          fonte: 'banco',
        });
      });
    }

    return resultados;
  }

  /**
   * Obtem estatisticas de cache de contexto.
   */
  async obterEstatisticas(): Promise<{
    totalContextos: number;
    totalParametros: number;
  }> {
    try {
      const chavesContexto = await this.cacheProvider.keys('cache:contexto:*');
      const chavesParametro = await this.cacheProvider.keys('cache:parametro:*');

      return {
        totalContextos: chavesContexto.length,
        totalParametros: chavesParametro.length,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatisticas: ${(error as Error).message}`);
      return {
        totalContextos: 0,
        totalParametros: 0,
      };
    }
  }
}
