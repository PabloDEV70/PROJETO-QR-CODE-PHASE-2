/**
 * PermissionCacheService - Servico de cache de permissoes.
 *
 * Gerencia o cache de permissoes verificadas, evitando
 * consultas repetidas ao banco de dados.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T05
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_PROVIDER, ICacheProvider } from '../../domain/repositories/cache-provider.interface';
import { PermissaoCache, DadosPermissaoCache } from '../../domain/entities/permissao-cache.entity';
import { ChaveCache } from '../../domain/value-objects/chave-cache.vo';
import { TtlCache } from '../../domain/value-objects/ttl-cache.vo';

export interface ResultadoPermissaoCache {
  encontrado: boolean;
  permissao?: PermissaoCache;
  fonte: 'cache' | 'banco';
}

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);
  private readonly ttlPadrao = TtlCache.medio(); // 5 minutos

  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: ICacheProvider,
  ) {}

  /**
   * Busca uma permissao no cache.
   */
  async buscarPermissao(codUsuario: number, codTela: number, operacao: string): Promise<ResultadoPermissaoCache> {
    const chave = ChaveCache.criarParaPermissao(codUsuario, codTela, operacao);

    try {
      const dadosCacheados = await this.cacheProvider.get<DadosPermissaoCache>(chave.valor);

      if (dadosCacheados) {
        const permissao = PermissaoCache.criar(dadosCacheados);
        this.logger.debug(`Cache HIT: permissao ${chave.valor}`);
        return {
          encontrado: true,
          permissao,
          fonte: 'cache',
        };
      }

      this.logger.debug(`Cache MISS: permissao ${chave.valor}`);
      return {
        encontrado: false,
        fonte: 'banco',
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar permissao do cache: ${(error as Error).message}`);
      return {
        encontrado: false,
        fonte: 'banco',
      };
    }
  }

  /**
   * Armazena uma permissao no cache.
   */
  async armazenarPermissao(permissao: PermissaoCache, ttl?: TtlCache): Promise<void> {
    const chave = ChaveCache.criarParaPermissao(permissao.codUsuario, permissao.codTela, permissao.nomeRecurso);

    try {
      const ttlFinal = ttl || this.ttlPadrao;

      await this.cacheProvider.set(chave.valor, permissao.toJSON(), {
        ttlSegundos: ttlFinal.segundos,
        metadata: {
          tipo: 'permissao',
          tipoPermissao: permissao.tipoPermissao,
        },
      });

      this.logger.debug(`Permissao armazenada em cache: ${chave.valor} (TTL: ${ttlFinal})`);
    } catch (error) {
      this.logger.error(`Erro ao armazenar permissao no cache: ${(error as Error).message}`);
    }
  }

  /**
   * Busca permissao de acesso a controle (botao, acao).
   */
  async buscarPermissaoControle(
    codUsuario: number,
    codTela: number,
    nomeControle: string,
  ): Promise<ResultadoPermissaoCache> {
    const chave = ChaveCache.criarParaControle(codUsuario, codTela, nomeControle);

    try {
      const dadosCacheados = await this.cacheProvider.get<DadosPermissaoCache>(chave.valor);

      if (dadosCacheados) {
        const permissao = PermissaoCache.criar(dadosCacheados);
        return {
          encontrado: true,
          permissao,
          fonte: 'cache',
        };
      }

      return {
        encontrado: false,
        fonte: 'banco',
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar permissao controle do cache: ${(error as Error).message}`);
      return {
        encontrado: false,
        fonte: 'banco',
      };
    }
  }

  /**
   * Armazena permissao de controle no cache.
   */
  async armazenarPermissaoControle(
    codUsuario: number,
    codTela: number,
    nomeControle: string,
    permitido: boolean,
    ttl?: TtlCache,
  ): Promise<void> {
    const chave = ChaveCache.criarParaControle(codUsuario, codTela, nomeControle);
    const permissao = PermissaoCache.criar({
      codUsuario,
      codTela,
      tipoPermissao: 'controle',
      nomeRecurso: nomeControle,
      permitido,
    });

    try {
      const ttlFinal = ttl || this.ttlPadrao;

      await this.cacheProvider.set(chave.valor, permissao.toJSON(), {
        ttlSegundos: ttlFinal.segundos,
      });
    } catch (error) {
      this.logger.error(`Erro ao armazenar permissao controle: ${(error as Error).message}`);
    }
  }

  /**
   * Invalida todas as permissoes de um usuario.
   */
  async invalidarPermissoesUsuario(codUsuario: number): Promise<number> {
    const padrao = `cache:permissao:user:${codUsuario}:*`;

    try {
      const removidas = await this.cacheProvider.deleteByPattern(padrao);
      this.logger.log(`Permissoes invalidadas para usuario ${codUsuario}: ${removidas} entradas`);
      return removidas;
    } catch (error) {
      this.logger.error(`Erro ao invalidar permissoes do usuario: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Invalida permissoes de uma tela especifica.
   */
  async invalidarPermissoesTela(codTela: number): Promise<number> {
    const padrao = `cache:permissao:*:recurso:tela:${codTela}:*`;

    try {
      const removidas = await this.cacheProvider.deleteByPattern(padrao);
      this.logger.log(`Permissoes invalidadas para tela ${codTela}: ${removidas} entradas`);
      return removidas;
    } catch (error) {
      this.logger.error(`Erro ao invalidar permissoes da tela: ${(error as Error).message}`);
      return 0;
    }
  }

  /**
   * Busca multiplas permissoes de uma vez.
   */
  async buscarPermissoesEmLote(
    codUsuario: number,
    permissoes: Array<{ codTela: number; operacao: string }>,
  ): Promise<Map<string, ResultadoPermissaoCache>> {
    const chaves = permissoes.map((p) => ChaveCache.criarParaPermissao(codUsuario, p.codTela, p.operacao));

    const chavesStr = chaves.map((c) => c.valor);
    const resultados = new Map<string, ResultadoPermissaoCache>();

    try {
      const dadosCacheados = await this.cacheProvider.mget<DadosPermissaoCache>(chavesStr);

      chaves.forEach((chave, index) => {
        const dados = dadosCacheados.get(chave.valor);
        const permissaoInfo = permissoes[index];
        const chaveResultado = `${permissaoInfo.codTela}:${permissaoInfo.operacao}`;

        if (dados) {
          resultados.set(chaveResultado, {
            encontrado: true,
            permissao: PermissaoCache.criar(dados),
            fonte: 'cache',
          });
        } else {
          resultados.set(chaveResultado, {
            encontrado: false,
            fonte: 'banco',
          });
        }
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar permissoes em lote: ${(error as Error).message}`);
      // Retornar todos como nao encontrados
      permissoes.forEach((p) => {
        resultados.set(`${p.codTela}:${p.operacao}`, {
          encontrado: false,
          fonte: 'banco',
        });
      });
    }

    return resultados;
  }

  /**
   * Obtem estatisticas de cache de permissoes.
   */
  async obterEstatisticas(): Promise<{
    totalEntradas: number;
    chavesPermissao: number;
    chavesControle: number;
  }> {
    try {
      const todasChaves = await this.cacheProvider.keys('cache:permissao:*');
      const chavesControle = await this.cacheProvider.keys('cache:controle:*');

      return {
        totalEntradas: todasChaves.length + chavesControle.length,
        chavesPermissao: todasChaves.length,
        chavesControle: chavesControle.length,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatisticas: ${(error as Error).message}`);
      return {
        totalEntradas: 0,
        chavesPermissao: 0,
        chavesControle: 0,
      };
    }
  }
}
