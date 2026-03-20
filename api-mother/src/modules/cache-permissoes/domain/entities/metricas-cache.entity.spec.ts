/**
 * Testes unitarios para MetricasCache.
 *
 * @module M6 - Cache de Permissoes
 */

import { MetricasCache } from './metricas-cache.entity';

describe('MetricasCache', () => {
  describe('criar', () => {
    it('deve criar metricas com valores padrao', () => {
      const metricas = MetricasCache.criar();

      expect(metricas.hits).toBe(0);
      expect(metricas.misses).toBe(0);
      expect(metricas.evictions).toBe(0);
      expect(metricas.tamanhoAtual).toBe(0);
    });

    it('deve criar metricas com valores iniciais', () => {
      const metricas = MetricasCache.criar({
        hits: 100,
        misses: 20,
        evictions: 5,
        tamanhoAtual: 50,
        tamanhoMaximo: 1000,
      });

      expect(metricas.hits).toBe(100);
      expect(metricas.misses).toBe(20);
      expect(metricas.evictions).toBe(5);
      expect(metricas.tamanhoAtual).toBe(50);
      expect(metricas.tamanhoMaximo).toBe(1000);
    });
  });

  describe('registrarHit', () => {
    it('deve incrementar contador de hits', () => {
      const metricas = MetricasCache.criar();

      metricas.registrarHit();
      metricas.registrarHit();
      metricas.registrarHit();

      expect(metricas.hits).toBe(3);
    });
  });

  describe('registrarMiss', () => {
    it('deve incrementar contador de misses', () => {
      const metricas = MetricasCache.criar();

      metricas.registrarMiss();
      metricas.registrarMiss();

      expect(metricas.misses).toBe(2);
    });
  });

  describe('registrarEviction', () => {
    it('deve incrementar contador de evictions', () => {
      const metricas = MetricasCache.criar();

      metricas.registrarEviction();

      expect(metricas.evictions).toBe(1);
    });
  });

  describe('taxaHit', () => {
    it('deve calcular taxa de hit corretamente', () => {
      const metricas = MetricasCache.criar({ hits: 80, misses: 20 });

      expect(metricas.taxaHit).toBe(80);
    });

    it('deve retornar 0 quando nao houver requisicoes', () => {
      const metricas = MetricasCache.criar();

      expect(metricas.taxaHit).toBe(0);
    });
  });

  describe('taxaMiss', () => {
    it('deve calcular taxa de miss corretamente', () => {
      const metricas = MetricasCache.criar({ hits: 80, misses: 20 });

      expect(metricas.taxaMiss).toBe(20);
    });
  });

  describe('totalRequisicoes', () => {
    it('deve somar hits e misses', () => {
      const metricas = MetricasCache.criar({ hits: 50, misses: 30 });

      expect(metricas.totalRequisicoes).toBe(80);
    });
  });

  describe('percentualOcupacao', () => {
    it('deve calcular percentual de ocupacao', () => {
      const metricas = MetricasCache.criar({
        tamanhoAtual: 500,
        tamanhoMaximo: 1000,
      });

      expect(metricas.percentualOcupacao).toBe(50);
    });

    it('deve retornar 0 quando tamanho maximo for 0', () => {
      const metricas = MetricasCache.criar({ tamanhoMaximo: 0 });

      expect(metricas.percentualOcupacao).toBe(0);
    });
  });

  describe('atualizarTamanho', () => {
    it('deve atualizar tamanho atual', () => {
      const metricas = MetricasCache.criar();

      metricas.atualizarTamanho(250);

      expect(metricas.tamanhoAtual).toBe(250);
    });
  });

  describe('resetar', () => {
    it('deve resetar todas as metricas', () => {
      const metricas = MetricasCache.criar({
        hits: 100,
        misses: 20,
        evictions: 5,
        tamanhoAtual: 50,
      });

      metricas.resetar();

      expect(metricas.hits).toBe(0);
      expect(metricas.misses).toBe(0);
      expect(metricas.evictions).toBe(0);
      expect(metricas.tamanhoAtual).toBe(0);
    });
  });

  describe('tempoAtivoFormatado', () => {
    it('deve formatar tempo em segundos', () => {
      const metricas = MetricasCache.criar({
        iniciadoEm: new Date(Date.now() - 30000), // 30 segundos atras
      });

      expect(metricas.tempoAtivoFormatado).toMatch(/^\d+s$/);
    });
  });

  describe('toJSON', () => {
    it('deve retornar objeto com todas as propriedades', () => {
      const metricas = MetricasCache.criar({ hits: 10, misses: 5 });
      const json = metricas.toJSON();

      expect(json).toHaveProperty('hits');
      expect(json).toHaveProperty('misses');
      expect(json).toHaveProperty('taxaHit');
      expect(json).toHaveProperty('taxaMiss');
      expect(json).toHaveProperty('tempoAtivo');
    });
  });
});
