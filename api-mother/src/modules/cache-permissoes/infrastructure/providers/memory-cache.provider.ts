/**
 * MemoryCacheProvider - Implementacao de cache em memoria.
 *
 * Usa um Map interno para armazenar os dados com suporte a TTL.
 * Recomendado para ambientes single-instance ou desenvolvimento.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T03
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ICacheProvider, OpcoesCacheSet, InfoChave } from '../../domain/repositories/cache-provider.interface';
import { EntradaCache } from '../../domain/entities/entrada-cache.entity';
import { MetricasCache } from '../../domain/entities/metricas-cache.entity';

interface ItemCacheInterno<T> {
  entrada: EntradaCache<T>;
  expiraEm: number;
}

@Injectable()
export class MemoryCacheProvider implements ICacheProvider, OnModuleDestroy {
  private readonly logger = new Logger(MemoryCacheProvider.name);
  private readonly cache = new Map<string, ItemCacheInterno<unknown>>();
  private readonly metricas = MetricasCache.criar({ tamanhoMaximo: 10000 });
  private intervaloLimpeza: NodeJS.Timeout | null = null;

  // Configuracoes
  private readonly TTL_PADRAO = 300; // 5 minutos
  private readonly INTERVALO_LIMPEZA = 60000; // 1 minuto
  private readonly TAMANHO_MAXIMO = 10000;

  constructor() {
    this.iniciarLimpezaAutomatica();
    this.logger.log('MemoryCacheProvider inicializado');
  }

  onModuleDestroy(): void {
    this.pararLimpezaAutomatica();
    this.cache.clear();
    this.logger.log('MemoryCacheProvider destruido');
  }

  async get<T>(chave: string): Promise<T | null> {
    const item = this.cache.get(chave) as ItemCacheInterno<T> | undefined;

    if (!item) {
      this.metricas.registrarMiss();
      return null;
    }

    if (item.entrada.estaExpirado()) {
      this.cache.delete(chave);
      this.metricas.registrarMiss();
      this.metricas.registrarEviction();
      this.atualizarTamanhoMetricas();
      return null;
    }

    item.entrada.registrarAcesso();
    this.metricas.registrarHit();
    return item.entrada.valor;
  }

  async set<T>(chave: string, valor: T, opcoes?: OpcoesCacheSet): Promise<void> {
    // Verificar limite de tamanho
    if (this.cache.size >= this.TAMANHO_MAXIMO && !this.cache.has(chave)) {
      await this.evictarItensAntigos();
    }

    const ttlSegundos = opcoes?.ttlSegundos || this.TTL_PADRAO;

    const entrada = EntradaCache.criar({
      chave,
      valor,
      ttlSegundos,
      metadata: opcoes?.metadata,
    });

    this.cache.set(chave, {
      entrada,
      expiraEm: Date.now() + ttlSegundos * 1000,
    });

    this.atualizarTamanhoMetricas();
  }

  async delete(chave: string): Promise<boolean> {
    const existia = this.cache.has(chave);
    this.cache.delete(chave);
    this.atualizarTamanhoMetricas();
    return existia;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.atualizarTamanhoMetricas();
    this.logger.log('Cache limpo completamente');
  }

  async has(chave: string): Promise<boolean> {
    const item = this.cache.get(chave);

    if (!item) {
      return false;
    }

    if (item.entrada.estaExpirado()) {
      this.cache.delete(chave);
      this.metricas.registrarEviction();
      this.atualizarTamanhoMetricas();
      return false;
    }

    return true;
  }

  async keys(padrao?: string): Promise<string[]> {
    const todasChaves = Array.from(this.cache.keys());

    if (!padrao) {
      return todasChaves;
    }

    // Converter padrao glob-like para regex
    const regexPadrao = this.converterPadraoParaRegex(padrao);
    return todasChaves.filter((chave) => regexPadrao.test(chave));
  }

  async getInfo(chave: string): Promise<InfoChave | null> {
    const item = this.cache.get(chave);

    if (!item || item.entrada.estaExpirado()) {
      return null;
    }

    return {
      chave,
      ttlRestante: item.entrada.ttlRestante(),
      criadoEm: item.entrada.criadoEm,
      tamanho: this.estimarTamanho(item.entrada.valor),
    };
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async touch(chave: string, ttlSegundos: number): Promise<boolean> {
    const item = this.cache.get(chave);

    if (!item || item.entrada.estaExpirado()) {
      return false;
    }

    // Recriar entrada com novo TTL
    const novaEntrada = EntradaCache.criar({
      chave,
      valor: item.entrada.valor,
      ttlSegundos,
      criadoEm: item.entrada.criadoEm,
      metadata: item.entrada.metadata,
    });

    this.cache.set(chave, {
      entrada: novaEntrada,
      expiraEm: Date.now() + ttlSegundos * 1000,
    });

    return true;
  }

  async mget<T>(chaves: string[]): Promise<Map<string, T>> {
    const resultado = new Map<string, T>();

    for (const chave of chaves) {
      const valor = await this.get<T>(chave);
      if (valor !== null) {
        resultado.set(chave, valor);
      }
    }

    return resultado;
  }

  async mset<T>(itens: Map<string, T>, opcoes?: OpcoesCacheSet): Promise<void> {
    for (const [chave, valor] of itens) {
      await this.set(chave, valor, opcoes);
    }
  }

  async mdelete(chaves: string[]): Promise<number> {
    let removidos = 0;

    for (const chave of chaves) {
      if (await this.delete(chave)) {
        removidos++;
      }
    }

    return removidos;
  }

  async deleteByPattern(padrao: string): Promise<number> {
    const chaves = await this.keys(padrao);
    return this.mdelete(chaves);
  }

  // Metodos auxiliares

  getMetricas(): MetricasCache {
    return this.metricas;
  }

  private iniciarLimpezaAutomatica(): void {
    this.intervaloLimpeza = setInterval(() => {
      this.limparExpirados();
    }, this.INTERVALO_LIMPEZA);
  }

  private pararLimpezaAutomatica(): void {
    if (this.intervaloLimpeza) {
      clearInterval(this.intervaloLimpeza);
      this.intervaloLimpeza = null;
    }
  }

  private limparExpirados(): void {
    let removidos = 0;
    const agora = Date.now();

    for (const [chave, item] of this.cache) {
      if (item.expiraEm < agora) {
        this.cache.delete(chave);
        removidos++;
        this.metricas.registrarEviction();
      }
    }

    if (removidos > 0) {
      this.atualizarTamanhoMetricas();
      this.logger.debug(`Limpeza automatica: ${removidos} itens expirados removidos`);
    }
  }

  private async evictarItensAntigos(): Promise<void> {
    // Estrategia: remover 10% dos itens mais antigos
    const quantidadeRemover = Math.ceil(this.TAMANHO_MAXIMO * 0.1);

    const itensOrdenados = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.entrada.criadoEm.getTime() - b.entrada.criadoEm.getTime(),
    );

    for (let i = 0; i < quantidadeRemover && i < itensOrdenados.length; i++) {
      this.cache.delete(itensOrdenados[i][0]);
      this.metricas.registrarEviction();
    }

    this.logger.debug(`Eviction: ${quantidadeRemover} itens antigos removidos`);
  }

  private atualizarTamanhoMetricas(): void {
    this.metricas.atualizarTamanho(this.cache.size);
  }

  private converterPadraoParaRegex(padrao: string): RegExp {
    const regexStr = padrao.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`);
  }

  private estimarTamanho(valor: unknown): number {
    try {
      return JSON.stringify(valor).length;
    } catch {
      return 0;
    }
  }
}
