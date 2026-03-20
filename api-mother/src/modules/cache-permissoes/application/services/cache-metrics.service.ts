/**
 * CacheMetricsService - Servico de metricas de cache.
 *
 * Coleta e expoe metricas de hit/miss, tamanho e performance
 * do cache de permissoes.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T12
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_PROVIDER, ICacheProvider } from '../../domain/repositories/cache-provider.interface';
import { MetricasCache } from '../../domain/entities/metricas-cache.entity';
import { MemoryCacheProvider } from '../../infrastructure/providers/memory-cache.provider';
import { RedisCacheProvider } from '../../infrastructure/providers/redis-cache.provider';

export interface MetricasCompletas {
  providerAtivo: string;
  metricas: {
    hits: number;
    misses: number;
    evictions: number;
    totalRequisicoes: number;
    taxaHit: string;
    taxaMiss: string;
    tamanhoAtual: number;
    tamanhoMaximo: number;
    percentualOcupacao: string;
    tempoAtivo: string;
  };
  distribuicao: {
    permissoes: number;
    contextos: number;
    parametros: number;
    controles: number;
  };
  ultimaAtualizacao: string;
}

export interface RegistroMetrica {
  timestamp: Date;
  hits: number;
  misses: number;
  tamanho: number;
  taxaHit: number;
}

@Injectable()
export class CacheMetricsService {
  private readonly logger = new Logger(CacheMetricsService.name);
  private readonly historicoMetricas: RegistroMetrica[] = [];
  private readonly MAX_HISTORICO = 1440; // 24 horas com intervalo de 1 minuto
  private intervaloColeta: NodeJS.Timeout | null = null;
  private readonly INTERVALO_COLETA = 60000; // 1 minuto

  constructor(
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: ICacheProvider,
  ) {
    this.iniciarColetaAutomatica();
  }

  /**
   * Obtem metricas completas do cache.
   */
  async obterMetricasCompletas(): Promise<MetricasCompletas> {
    try {
      const metricas = this.obterMetricasInternas();
      const distribuicao = await this.obterDistribuicaoPorTipo();
      const providerAtivo = this.obterProviderAtivo();

      return {
        providerAtivo,
        metricas: metricas.toJSON() as MetricasCompletas['metricas'],
        distribuicao,
        ultimaAtualizacao: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Erro ao obter metricas: ${(error as Error).message}`);
      return this.obterMetricasVazias();
    }
  }

  /**
   * Obtem metricas simplificadas (hit/miss).
   */
  async obterMetricasSimplificadas(): Promise<{
    taxaHit: number;
    taxaMiss: number;
    totalRequisicoes: number;
    tamanhoCache: number;
  }> {
    const metricas = this.obterMetricasInternas();

    return {
      taxaHit: metricas.taxaHit,
      taxaMiss: metricas.taxaMiss,
      totalRequisicoes: metricas.totalRequisicoes,
      tamanhoCache: metricas.tamanhoAtual,
    };
  }

  /**
   * Obtem historico de metricas.
   */
  obterHistorico(ultimosMinutos?: number): RegistroMetrica[] {
    if (!ultimosMinutos) {
      return [...this.historicoMetricas];
    }

    const limite = new Date(Date.now() - ultimosMinutos * 60000);
    return this.historicoMetricas.filter((r) => r.timestamp >= limite);
  }

  /**
   * Calcula tendencias de hit rate.
   */
  calcularTendencias(): {
    tendenciaHitRate: 'crescendo' | 'estavel' | 'decrescendo';
    mediaUltimaHora: number;
    mediaUltimas24h: number;
    variacaoPercentual: number;
  } {
    const ultimaHora = this.obterHistorico(60);
    const ultimas24h = this.obterHistorico(1440);

    if (ultimaHora.length < 2 || ultimas24h.length < 2) {
      return {
        tendenciaHitRate: 'estavel',
        mediaUltimaHora: 0,
        mediaUltimas24h: 0,
        variacaoPercentual: 0,
      };
    }

    const mediaUltimaHora = this.calcularMediaTaxaHit(ultimaHora);
    const mediaUltimas24h = this.calcularMediaTaxaHit(ultimas24h);
    const variacaoPercentual = mediaUltimas24h > 0 ? ((mediaUltimaHora - mediaUltimas24h) / mediaUltimas24h) * 100 : 0;

    let tendenciaHitRate: 'crescendo' | 'estavel' | 'decrescendo';
    if (variacaoPercentual > 5) {
      tendenciaHitRate = 'crescendo';
    } else if (variacaoPercentual < -5) {
      tendenciaHitRate = 'decrescendo';
    } else {
      tendenciaHitRate = 'estavel';
    }

    return {
      tendenciaHitRate,
      mediaUltimaHora: Number(mediaUltimaHora.toFixed(2)),
      mediaUltimas24h: Number(mediaUltimas24h.toFixed(2)),
      variacaoPercentual: Number(variacaoPercentual.toFixed(2)),
    };
  }

  /**
   * Reseta as metricas (para testes ou manutencao).
   */
  resetarMetricas(): void {
    const metricas = this.obterMetricasInternas();
    metricas.resetar();
    this.historicoMetricas.length = 0;
    this.logger.log('Metricas resetadas');
  }

  /**
   * Verifica saude do cache.
   */
  async verificarSaude(): Promise<{
    status: 'saudavel' | 'atencao' | 'critico';
    problemas: string[];
    recomendacoes: string[];
  }> {
    const problemas: string[] = [];
    const recomendacoes: string[] = [];
    const metricas = this.obterMetricasInternas();

    // Verificar taxa de hit
    if (metricas.taxaHit < 50 && metricas.totalRequisicoes > 100) {
      problemas.push(`Taxa de hit baixa: ${metricas.taxaHit}%`);
      recomendacoes.push('Considere aumentar o TTL das entradas');
    }

    // Verificar ocupacao
    if (metricas.percentualOcupacao > 90) {
      problemas.push(`Cache quase cheio: ${metricas.percentualOcupacao}% ocupado`);
      recomendacoes.push('Considere aumentar o tamanho maximo ou reduzir TTL');
    }

    // Verificar evictions
    const evictionRate = metricas.totalRequisicoes > 0 ? (metricas.evictions / metricas.totalRequisicoes) * 100 : 0;

    if (evictionRate > 10) {
      problemas.push(`Taxa de eviction alta: ${evictionRate.toFixed(2)}%`);
      recomendacoes.push('Cache pode estar subdimensionado');
    }

    // Verificar se provider esta disponivel
    const provider = this.obterProviderAtivo();
    if (provider === 'Memory' && this.isRedisConfigurado()) {
      problemas.push('Redis configurado mas usando Memory (fallback)');
      recomendacoes.push('Verificar conexao com Redis');
    }

    let status: 'saudavel' | 'atencao' | 'critico';
    if (problemas.length === 0) {
      status = 'saudavel';
    } else if (problemas.length <= 2) {
      status = 'atencao';
    } else {
      status = 'critico';
    }

    return { status, problemas, recomendacoes };
  }

  // Metodos privados

  private obterMetricasInternas(): MetricasCache {
    // Tentar obter metricas do provider especifico
    if (this.cacheProvider instanceof MemoryCacheProvider) {
      return this.cacheProvider.getMetricas();
    }

    // Fallback para metricas simuladas
    return MetricasCache.criar();
  }

  private obterProviderAtivo(): string {
    if (this.cacheProvider instanceof RedisCacheProvider) {
      return this.cacheProvider.getProviderAtivo();
    }
    return 'Memory';
  }

  private isRedisConfigurado(): boolean {
    return this.cacheProvider instanceof RedisCacheProvider;
  }

  private async obterDistribuicaoPorTipo(): Promise<MetricasCompletas['distribuicao']> {
    try {
      const [permissoes, contextos, parametros, controles] = await Promise.all([
        this.cacheProvider.keys('cache:permissao:*'),
        this.cacheProvider.keys('cache:contexto:*'),
        this.cacheProvider.keys('cache:parametro:*'),
        this.cacheProvider.keys('cache:controle:*'),
      ]);

      return {
        permissoes: permissoes.length,
        contextos: contextos.length,
        parametros: parametros.length,
        controles: controles.length,
      };
    } catch {
      return {
        permissoes: 0,
        contextos: 0,
        parametros: 0,
        controles: 0,
      };
    }
  }

  private iniciarColetaAutomatica(): void {
    this.intervaloColeta = setInterval(() => {
      this.coletarMetricas();
    }, this.INTERVALO_COLETA);
  }

  private coletarMetricas(): void {
    const metricas = this.obterMetricasInternas();

    this.historicoMetricas.push({
      timestamp: new Date(),
      hits: metricas.hits,
      misses: metricas.misses,
      tamanho: metricas.tamanhoAtual,
      taxaHit: metricas.taxaHit,
    });

    // Manter apenas os ultimos MAX_HISTORICO registros
    if (this.historicoMetricas.length > this.MAX_HISTORICO) {
      this.historicoMetricas.shift();
    }
  }

  private calcularMediaTaxaHit(registros: RegistroMetrica[]): number {
    if (registros.length === 0) return 0;
    const soma = registros.reduce((acc, r) => acc + r.taxaHit, 0);
    return soma / registros.length;
  }

  private obterMetricasVazias(): MetricasCompletas {
    return {
      providerAtivo: 'Desconhecido',
      metricas: {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequisicoes: 0,
        taxaHit: '0%',
        taxaMiss: '0%',
        tamanhoAtual: 0,
        tamanhoMaximo: 0,
        percentualOcupacao: '0%',
        tempoAtivo: '0s',
      },
      distribuicao: {
        permissoes: 0,
        contextos: 0,
        parametros: 0,
        controles: 0,
      },
      ultimaAtualizacao: new Date().toISOString(),
    };
  }
}
