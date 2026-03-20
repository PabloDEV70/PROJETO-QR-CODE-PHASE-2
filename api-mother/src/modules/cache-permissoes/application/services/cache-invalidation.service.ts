/**
 * CacheInvalidationService - Servico de invalidacao de cache.
 *
 * Gerencia a invalidacao de cache em resposta a eventos
 * como alteracoes de permissoes, logout, etc.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T07
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_PROVIDER, ICacheProvider } from '../../domain/repositories/cache-provider.interface';
import { PermissionCacheService } from './permission-cache.service';
import { UserContextCacheService } from './user-context-cache.service';

export type TipoInvalidacao = 'usuario' | 'tela' | 'grupo' | 'empresa' | 'global' | 'permissao' | 'parametro';

export interface ResultadoInvalidacao {
  tipo: TipoInvalidacao;
  entradasRemovidas: number;
  duracaoMs: number;
  sucesso: boolean;
  erro?: string;
}

export interface EventoInvalidacao {
  tipo: TipoInvalidacao;
  identificador?: number | string;
  motivo?: string;
  timestamp: Date;
}

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private readonly historicoInvalidacoes: EventoInvalidacao[] = [];
  private readonly MAX_HISTORICO = 100;

  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: ICacheProvider,
    private readonly permissionCacheService: PermissionCacheService,
    private readonly userContextCacheService: UserContextCacheService,
  ) {}

  /**
   * Invalida todo o cache de um usuario especifico.
   */
  async invalidarPorUsuario(codUsuario: number, motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.log(`Invalidando cache do usuario ${codUsuario}. Motivo: ${motivo || 'Nao especificado'}`);

      // Invalidar permissoes
      const permissoesRemovidas = await this.permissionCacheService.invalidarPermissoesUsuario(codUsuario);

      // Invalidar contexto
      await this.userContextCacheService.invalidarContexto(codUsuario);

      // Invalidar parametros
      const parametrosRemovidos = await this.userContextCacheService.invalidarParametrosUsuario(codUsuario);

      const totalRemovido = permissoesRemovidas + parametrosRemovidos + 1; // +1 do contexto

      this.registrarEvento({
        tipo: 'usuario',
        identificador: codUsuario,
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'usuario',
        entradasRemovidas: totalRemovido,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao invalidar cache do usuario ${codUsuario}: ${(error as Error).message}`);
      return {
        tipo: 'usuario',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Invalida cache de uma tela especifica (para todos os usuarios).
   */
  async invalidarPorTela(codTela: number, motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.log(`Invalidando cache da tela ${codTela}. Motivo: ${motivo || 'Nao especificado'}`);

      const permissoesRemovidas = await this.permissionCacheService.invalidarPermissoesTela(codTela);

      this.registrarEvento({
        tipo: 'tela',
        identificador: codTela,
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'tela',
        entradasRemovidas: permissoesRemovidas,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao invalidar cache da tela ${codTela}: ${(error as Error).message}`);
      return {
        tipo: 'tela',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Invalida cache de todos os usuarios de um grupo.
   */
  async invalidarPorGrupo(codGrupo: number, motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.log(`Invalidando cache do grupo ${codGrupo}. Motivo: ${motivo || 'Nao especificado'}`);

      // Buscar todas as chaves de contexto e verificar quais pertencem ao grupo
      // Como nao temos indice por grupo, fazemos invalidacao por padrao
      const padrao = `cache:*:grupo:${codGrupo}:*`;
      const removidas = await this.cacheProvider.deleteByPattern(padrao);

      this.registrarEvento({
        tipo: 'grupo',
        identificador: codGrupo,
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'grupo',
        entradasRemovidas: removidas,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao invalidar cache do grupo ${codGrupo}: ${(error as Error).message}`);
      return {
        tipo: 'grupo',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Invalida cache de todos os usuarios de uma empresa.
   */
  async invalidarPorEmpresa(codEmpresa: number, motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.log(`Invalidando cache da empresa ${codEmpresa}. Motivo: ${motivo || 'Nao especificado'}`);

      const padrao = `cache:*:empresa:${codEmpresa}:*`;
      const removidas = await this.cacheProvider.deleteByPattern(padrao);

      this.registrarEvento({
        tipo: 'empresa',
        identificador: codEmpresa,
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'empresa',
        entradasRemovidas: removidas,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao invalidar cache da empresa ${codEmpresa}: ${(error as Error).message}`);
      return {
        tipo: 'empresa',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Invalida TODO o cache (limpar completamente).
   */
  async invalidarGlobal(motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.warn(`INVALIDACAO GLOBAL do cache. Motivo: ${motivo || 'Nao especificado'}`);

      const tamanhoAntes = await this.cacheProvider.size();
      await this.cacheProvider.clear();

      this.registrarEvento({
        tipo: 'global',
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'global',
        entradasRemovidas: tamanhoAntes,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro na invalidacao global: ${(error as Error).message}`);
      return {
        tipo: 'global',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Invalida por padrao customizado.
   */
  async invalidarPorPadrao(padrao: string, motivo?: string): Promise<ResultadoInvalidacao> {
    const inicio = Date.now();

    try {
      this.logger.log(`Invalidando cache por padrao: ${padrao}. Motivo: ${motivo || 'Nao especificado'}`);

      const removidas = await this.cacheProvider.deleteByPattern(padrao);

      this.registrarEvento({
        tipo: 'permissao',
        identificador: padrao,
        motivo,
        timestamp: new Date(),
      });

      return {
        tipo: 'permissao',
        entradasRemovidas: removidas,
        duracaoMs: Date.now() - inicio,
        sucesso: true,
      };
    } catch (error) {
      this.logger.error(`Erro ao invalidar por padrao: ${(error as Error).message}`);
      return {
        tipo: 'permissao',
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: (error as Error).message,
      };
    }
  }

  /**
   * Obtem historico de invalidacoes recentes.
   */
  obterHistoricoInvalidacoes(): EventoInvalidacao[] {
    return [...this.historicoInvalidacoes];
  }

  /**
   * Obtem estatisticas de invalidacao.
   */
  obterEstatisticas(): {
    totalInvalidacoes: number;
    porTipo: Record<TipoInvalidacao, number>;
    ultimaInvalidacao?: EventoInvalidacao;
  } {
    const porTipo: Record<TipoInvalidacao, number> = {
      usuario: 0,
      tela: 0,
      grupo: 0,
      empresa: 0,
      global: 0,
      permissao: 0,
      parametro: 0,
    };

    this.historicoInvalidacoes.forEach((evento) => {
      porTipo[evento.tipo]++;
    });

    return {
      totalInvalidacoes: this.historicoInvalidacoes.length,
      porTipo,
      ultimaInvalidacao: this.historicoInvalidacoes[this.historicoInvalidacoes.length - 1],
    };
  }

  private registrarEvento(evento: EventoInvalidacao): void {
    this.historicoInvalidacoes.push(evento);

    // Manter apenas os ultimos MAX_HISTORICO eventos
    if (this.historicoInvalidacoes.length > this.MAX_HISTORICO) {
      this.historicoInvalidacoes.shift();
    }
  }
}
