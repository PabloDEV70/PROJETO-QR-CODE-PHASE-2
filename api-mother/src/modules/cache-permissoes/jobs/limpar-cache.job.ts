/**
 * LimparCacheJob - Job agendado para limpeza de cache.
 *
 * Executa periodicamente para:
 * - Remover entradas expiradas
 * - Compactar cache se necessario
 * - Gerar relatorios de uso
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T09
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheInvalidationService } from '../application/services/cache-invalidation.service';
import { CacheMetricsService } from '../application/services/cache-metrics.service';

export interface ConfiguracaoLimpeza {
  intervaloMinutos: number;
  habilitado: boolean;
  limiteOcupacaoPercent: number;
  limiteIdadeHoras: number;
}

export interface ResultadoLimpeza {
  executadoEm: Date;
  entradasAntes: number;
  entradasDepois: number;
  entradasRemovidas: number;
  duracaoMs: number;
  motivo: 'agendado' | 'limite_ocupacao' | 'manual';
}

@Injectable()
export class LimparCacheJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LimparCacheJob.name);
  private intervaloExecucao: NodeJS.Timeout | null = null;
  private ultimoResultado: ResultadoLimpeza | null = null;
  private readonly historicoExecucoes: ResultadoLimpeza[] = [];
  private readonly MAX_HISTORICO = 100;

  private configuracao: ConfiguracaoLimpeza = {
    intervaloMinutos: 30,
    habilitado: true,
    limiteOcupacaoPercent: 85,
    limiteIdadeHoras: 24,
  };

  constructor(
    private readonly cacheInvalidationService: CacheInvalidationService,
    private readonly cacheMetricsService: CacheMetricsService,
    private readonly configService: ConfigService,
  ) {
    this.carregarConfiguracao();
  }

  onModuleInit(): void {
    if (this.configuracao.habilitado) {
      this.iniciar();
    }
  }

  onModuleDestroy(): void {
    this.parar();
  }

  /**
   * Inicia o job de limpeza agendada.
   */
  iniciar(): void {
    if (this.intervaloExecucao) {
      this.logger.warn('Job de limpeza ja esta em execucao');
      return;
    }

    const intervaloMs = this.configuracao.intervaloMinutos * 60 * 1000;

    this.intervaloExecucao = setInterval(() => {
      void this.executar('agendado');
    }, intervaloMs);

    this.logger.log(`Job de limpeza iniciado (intervalo: ${this.configuracao.intervaloMinutos} min)`);
  }

  /**
   * Para o job de limpeza agendada.
   */
  parar(): void {
    if (this.intervaloExecucao) {
      clearInterval(this.intervaloExecucao);
      this.intervaloExecucao = null;
      this.logger.log('Job de limpeza parado');
    }
  }

  /**
   * Executa a limpeza do cache.
   */
  async executar(motivo: ResultadoLimpeza['motivo'] = 'manual'): Promise<ResultadoLimpeza> {
    const inicio = Date.now();
    const metricas = await this.cacheMetricsService.obterMetricasCompletas();

    this.logger.log(`Iniciando limpeza de cache (motivo: ${motivo})`);

    try {
      // Verificar se precisa limpar por ocupacao
      const ocupacao = parseFloat(metricas.metricas.percentualOcupacao);
      if (ocupacao > this.configuracao.limiteOcupacaoPercent) {
        this.logger.warn(`Ocupacao alta detectada: ${ocupacao}%`);
        motivo = 'limite_ocupacao';
      }

      const tamanhoAntes = metricas.metricas.tamanhoAtual;

      // Executar invalidacao de entradas antigas
      // Aqui invalidamos por padrao as entradas mais antigas
      const resultado = await this.cacheInvalidationService.invalidarPorPadrao(
        'cache:*:expired:*',
        `Limpeza agendada - ${motivo}`,
      );

      // Se ocupacao ainda alta, invalidar mais agressivamente
      if (ocupacao > 95) {
        await this.cacheInvalidationService.invalidarGlobal('Ocupacao critica');
      }

      const metricasApos = await this.cacheMetricsService.obterMetricasCompletas();
      const tamanhoDepois = metricasApos.metricas.tamanhoAtual;

      const resultadoLimpeza: ResultadoLimpeza = {
        executadoEm: new Date(),
        entradasAntes: tamanhoAntes,
        entradasDepois: tamanhoDepois,
        entradasRemovidas: resultado.entradasRemovidas,
        duracaoMs: Date.now() - inicio,
        motivo,
      };

      this.registrarResultado(resultadoLimpeza);

      this.logger.log(
        `Limpeza concluida: ${resultadoLimpeza.entradasRemovidas} entradas removidas em ${resultadoLimpeza.duracaoMs}ms`,
      );

      return resultadoLimpeza;
    } catch (error) {
      this.logger.error(`Erro na limpeza de cache: ${(error as Error).message}`);

      const resultadoErro: ResultadoLimpeza = {
        executadoEm: new Date(),
        entradasAntes: metricas.metricas.tamanhoAtual,
        entradasDepois: metricas.metricas.tamanhoAtual,
        entradasRemovidas: 0,
        duracaoMs: Date.now() - inicio,
        motivo,
      };

      return resultadoErro;
    }
  }

  /**
   * Obtem o ultimo resultado de limpeza.
   */
  obterUltimoResultado(): ResultadoLimpeza | null {
    return this.ultimoResultado;
  }

  /**
   * Obtem historico de execucoes.
   */
  obterHistorico(): ResultadoLimpeza[] {
    return [...this.historicoExecucoes];
  }

  /**
   * Atualiza a configuracao do job.
   */
  atualizarConfiguracao(novaConfiguracao: Partial<ConfiguracaoLimpeza>): void {
    this.configuracao = { ...this.configuracao, ...novaConfiguracao };

    // Reiniciar se necessario
    if (this.intervaloExecucao && this.configuracao.habilitado) {
      this.parar();
      this.iniciar();
    } else if (!this.intervaloExecucao && this.configuracao.habilitado) {
      this.iniciar();
    } else if (this.intervaloExecucao && !this.configuracao.habilitado) {
      this.parar();
    }

    this.logger.log('Configuracao de limpeza atualizada', this.configuracao);
  }

  /**
   * Obtem a configuracao atual.
   */
  obterConfiguracao(): ConfiguracaoLimpeza {
    return { ...this.configuracao };
  }

  /**
   * Verifica se o job esta em execucao.
   */
  estaEmExecucao(): boolean {
    return this.intervaloExecucao !== null;
  }

  private carregarConfiguracao(): void {
    const intervalo = this.configService.get<number>('CACHE_CLEANUP_INTERVAL_MINUTES');
    const habilitado = this.configService.get<string>('CACHE_CLEANUP_ENABLED');
    const limiteOcupacao = this.configService.get<number>('CACHE_CLEANUP_OCUPACAO_LIMIT');

    if (intervalo) {
      this.configuracao.intervaloMinutos = intervalo;
    }

    if (habilitado !== undefined) {
      this.configuracao.habilitado = habilitado !== 'false';
    }

    if (limiteOcupacao) {
      this.configuracao.limiteOcupacaoPercent = limiteOcupacao;
    }
  }

  private registrarResultado(resultado: ResultadoLimpeza): void {
    this.ultimoResultado = resultado;
    this.historicoExecucoes.push(resultado);

    if (this.historicoExecucoes.length > this.MAX_HISTORICO) {
      this.historicoExecucoes.shift();
    }
  }
}
