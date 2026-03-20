/**
 * MonitorarInvalidacaoJob - Job para monitorar eventos de invalidacao.
 *
 * Monitora alteracoes no banco que devem disparar invalidacao de cache:
 * - Alteracoes em tabelas de permissao (TSIUSU, TSIGRU, etc)
 * - Alteracoes em parametros de usuario
 * - Alteracoes em controles de tela
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T08
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheInvalidationService, TipoInvalidacao } from '../application/services/cache-invalidation.service';

// Interface para o servico de banco de dados (injetado opcionalmente)
export interface IQueryExecutor {
  executar<T>(query: string, parametros?: Record<string, unknown>): Promise<T[]>;
}

export const QUERY_EXECUTOR = Symbol('IQueryExecutor');

export interface EventoAlteracao {
  tabela: string;
  tipoOperacao: 'INSERT' | 'UPDATE' | 'DELETE';
  codUsuario?: number;
  codTela?: number;
  codGrupo?: number;
  timestamp: Date;
}

export interface ConfiguracaoMonitoramento {
  intervaloSegundos: number;
  habilitado: boolean;
  tabelasMonitoradas: string[];
}

@Injectable()
export class MonitorarInvalidacaoJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorarInvalidacaoJob.name);
  private intervaloMonitoramento: NodeJS.Timeout | null = null;
  private ultimaVerificacao: Date = new Date();
  private readonly eventosDetectados: EventoAlteracao[] = [];
  private readonly MAX_EVENTOS = 500;

  private configuracao: ConfiguracaoMonitoramento = {
    intervaloSegundos: 30,
    habilitado: false, // Desabilitado por padrao (requer configuracao de banco)
    tabelasMonitoradas: [
      'TSIUSU', // Usuarios
      'TSIGRU', // Grupos
      'TSIPER', // Permissoes
      'TSIPRM', // Parametros
      'TSIITE', // Itens de tela
      'TSIACT', // Acoes
    ],
  };

  // Queries para monitoramento (SQL Server)
  private readonly queries = {
    verificarAlteracoes: `
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        MAX(STATS_DATE(i.object_id, i.index_id)) AS last_updated
      FROM sys.tables t
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN sys.indexes i ON t.object_id = i.object_id
      WHERE t.name IN (:tabelas)
      AND STATS_DATE(i.object_id, i.index_id) > :ultimaVerificacao
      GROUP BY s.name, t.name
    `,
    verificarUsuariosAlterados: `
      SELECT DISTINCT
        CODUSU as codUsuario,
        DTALTER as dataAlteracao
      FROM TSIUSU
      WHERE DTALTER > :ultimaVerificacao
    `,
  };

  constructor(
    private readonly cacheInvalidationService: CacheInvalidationService,
    private readonly configService: ConfigService,
    @Optional() @Inject(QUERY_EXECUTOR) private readonly queryExecutor?: IQueryExecutor,
  ) {
    this.carregarConfiguracao();
  }

  onModuleInit(): void {
    if (this.configuracao.habilitado && this.queryExecutor) {
      this.iniciar();
    } else if (this.configuracao.habilitado) {
      this.logger.warn('Monitoramento habilitado mas QueryExecutor nao disponivel');
    }
  }

  onModuleDestroy(): void {
    this.parar();
  }

  /**
   * Inicia o monitoramento de alteracoes.
   */
  iniciar(): void {
    if (this.intervaloMonitoramento) {
      this.logger.warn('Monitoramento ja esta em execucao');
      return;
    }

    if (!this.queryExecutor) {
      this.logger.error('QueryExecutor nao disponivel, monitoramento nao pode iniciar');
      return;
    }

    const intervaloMs = this.configuracao.intervaloSegundos * 1000;

    this.intervaloMonitoramento = setInterval(() => {
      void this.verificarAlteracoes();
    }, intervaloMs);

    this.logger.log(`Monitoramento de invalidacao iniciado (intervalo: ${this.configuracao.intervaloSegundos}s)`);
  }

  /**
   * Para o monitoramento.
   */
  parar(): void {
    if (this.intervaloMonitoramento) {
      clearInterval(this.intervaloMonitoramento);
      this.intervaloMonitoramento = null;
      this.logger.log('Monitoramento de invalidacao parado');
    }
  }

  /**
   * Verifica alteracoes e dispara invalidacoes.
   */
  async verificarAlteracoes(): Promise<EventoAlteracao[]> {
    if (!this.queryExecutor) {
      return [];
    }

    const eventosNovos: EventoAlteracao[] = [];
    const agora = new Date();

    try {
      // Verificar usuarios alterados
      const usuariosAlterados = await this.verificarUsuariosAlterados();
      eventosNovos.push(...usuariosAlterados);

      // Para cada evento, disparar invalidacao
      for (const evento of eventosNovos) {
        await this.processarEvento(evento);
      }

      this.ultimaVerificacao = agora;
      return eventosNovos;
    } catch (error) {
      this.logger.error(`Erro ao verificar alteracoes: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Registra um evento de alteracao manualmente.
   */
  async registrarEvento(evento: Omit<EventoAlteracao, 'timestamp'>): Promise<void> {
    const eventoCompleto: EventoAlteracao = {
      ...evento,
      timestamp: new Date(),
    };

    await this.processarEvento(eventoCompleto);
  }

  /**
   * Obtem eventos detectados recentes.
   */
  obterEventos(ultimos?: number): EventoAlteracao[] {
    if (!ultimos) {
      return [...this.eventosDetectados];
    }
    return this.eventosDetectados.slice(-ultimos);
  }

  /**
   * Obtem estatisticas de monitoramento.
   */
  obterEstatisticas(): {
    totalEventos: number;
    eventosUltimaHora: number;
    ultimaVerificacao: Date;
    estaAtivo: boolean;
    tabelasMonitoradas: string[];
  } {
    const umaHoraAtras = new Date(Date.now() - 3600000);
    const eventosUltimaHora = this.eventosDetectados.filter((e) => e.timestamp >= umaHoraAtras).length;

    return {
      totalEventos: this.eventosDetectados.length,
      eventosUltimaHora,
      ultimaVerificacao: this.ultimaVerificacao,
      estaAtivo: this.intervaloMonitoramento !== null,
      tabelasMonitoradas: this.configuracao.tabelasMonitoradas,
    };
  }

  /**
   * Atualiza a configuracao.
   */
  atualizarConfiguracao(novaConfiguracao: Partial<ConfiguracaoMonitoramento>): void {
    this.configuracao = { ...this.configuracao, ...novaConfiguracao };

    if (this.intervaloMonitoramento) {
      this.parar();
      if (this.configuracao.habilitado) {
        this.iniciar();
      }
    }

    this.logger.log('Configuracao de monitoramento atualizada');
  }

  // Metodos privados

  private async verificarUsuariosAlterados(): Promise<EventoAlteracao[]> {
    if (!this.queryExecutor) return [];

    try {
      interface ResultadoUsuario {
        codUsuario: number;
        dataAlteracao: Date;
      }

      const resultados = await this.queryExecutor.executar<ResultadoUsuario>(this.queries.verificarUsuariosAlterados, {
        ultimaVerificacao: this.ultimaVerificacao,
      });

      return resultados.map((r) => ({
        tabela: 'TSIUSU',
        tipoOperacao: 'UPDATE' as const,
        codUsuario: r.codUsuario,
        timestamp: r.dataAlteracao,
      }));
    } catch (error) {
      this.logger.error(`Erro ao verificar usuarios alterados: ${(error as Error).message}`);
      return [];
    }
  }

  private async processarEvento(evento: EventoAlteracao): Promise<void> {
    // Registrar evento
    this.eventosDetectados.push(evento);
    if (this.eventosDetectados.length > this.MAX_EVENTOS) {
      this.eventosDetectados.shift();
    }

    // Disparar invalidacao baseada no tipo de evento
    if (evento.codUsuario) {
      await this.cacheInvalidationService.invalidarPorUsuario(evento.codUsuario, `Alteracao em ${evento.tabela}`);
    } else if (evento.codTela) {
      await this.cacheInvalidationService.invalidarPorTela(evento.codTela, `Alteracao em ${evento.tabela}`);
    } else if (evento.codGrupo) {
      await this.cacheInvalidationService.invalidarPorGrupo(evento.codGrupo, `Alteracao em ${evento.tabela}`);
    }

    this.logger.debug(`Evento processado: ${evento.tabela} - ${evento.tipoOperacao}`);
  }

  private determinarTipoInvalidacao(evento: EventoAlteracao): TipoInvalidacao {
    switch (evento.tabela) {
      case 'TSIUSU':
        return 'usuario';
      case 'TSIGRU':
        return 'grupo';
      case 'TSIITE':
      case 'TSIACT':
        return 'tela';
      case 'TSIPRM':
        return 'parametro';
      default:
        return 'permissao';
    }
  }

  private carregarConfiguracao(): void {
    const intervalo = this.configService.get<number>('CACHE_MONITOR_INTERVAL_SECONDS');
    const habilitado = this.configService.get<string>('CACHE_MONITOR_ENABLED');

    if (intervalo) {
      this.configuracao.intervaloSegundos = intervalo;
    }

    if (habilitado !== undefined) {
      this.configuracao.habilitado = habilitado === 'true';
    }
  }
}
