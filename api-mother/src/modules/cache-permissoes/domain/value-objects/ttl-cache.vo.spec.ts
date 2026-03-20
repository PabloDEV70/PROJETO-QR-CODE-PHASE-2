/**
 * Testes unitarios para TtlCache.
 *
 * @module M6 - Cache de Permissoes
 */

import { TtlCache } from './ttl-cache.vo';

describe('TtlCache', () => {
  describe('criar', () => {
    it('deve criar TTL com segundos validos', () => {
      const ttl = TtlCache.criar(300);

      expect(ttl.segundos).toBe(300);
    });

    it('deve lancar erro para TTL abaixo do minimo', () => {
      expect(() => TtlCache.criar(5)).toThrow('TTL minimo');
    });

    it('deve lancar erro para TTL acima do maximo', () => {
      expect(() => TtlCache.criar(999999999)).toThrow('TTL maximo');
    });
  });

  describe('criarDePreset', () => {
    it('deve criar TTL curto (1 minuto)', () => {
      const ttl = TtlCache.criarDePreset('curto');

      expect(ttl.segundos).toBe(60);
    });

    it('deve criar TTL medio (5 minutos)', () => {
      const ttl = TtlCache.criarDePreset('medio');

      expect(ttl.segundos).toBe(300);
    });

    it('deve criar TTL longo (15 minutos)', () => {
      const ttl = TtlCache.criarDePreset('longo');

      expect(ttl.segundos).toBe(900);
    });

    it('deve criar TTL permanente (24 horas)', () => {
      const ttl = TtlCache.criarDePreset('permanente');

      expect(ttl.segundos).toBe(86400);
    });
  });

  describe('metodos estaticos de conveniencia', () => {
    it('curto() deve criar TTL de 1 minuto', () => {
      const ttl = TtlCache.curto();
      expect(ttl.segundos).toBe(60);
    });

    it('medio() deve criar TTL de 5 minutos', () => {
      const ttl = TtlCache.medio();
      expect(ttl.segundos).toBe(300);
    });

    it('longo() deve criar TTL de 15 minutos', () => {
      const ttl = TtlCache.longo();
      expect(ttl.segundos).toBe(900);
    });

    it('permanente() deve criar TTL de 24 horas', () => {
      const ttl = TtlCache.permanente();
      expect(ttl.segundos).toBe(86400);
    });
  });

  describe('deMinutos', () => {
    it('deve converter minutos para segundos', () => {
      const ttl = TtlCache.deMinutos(10);

      expect(ttl.segundos).toBe(600);
    });
  });

  describe('deHoras', () => {
    it('deve converter horas para segundos', () => {
      const ttl = TtlCache.deHoras(2);

      expect(ttl.segundos).toBe(7200);
    });
  });

  describe('milissegundos', () => {
    it('deve retornar valor em milissegundos', () => {
      const ttl = TtlCache.criar(60);

      expect(ttl.milissegundos).toBe(60000);
    });
  });

  describe('minutos', () => {
    it('deve retornar valor em minutos', () => {
      const ttl = TtlCache.criar(300);

      expect(ttl.minutos).toBe(5);
    });
  });

  describe('calcularExpiracao', () => {
    it('deve calcular data de expiracao', () => {
      const ttl = TtlCache.criar(60);
      const antes = Date.now();
      const expiracao = ttl.calcularExpiracao();
      const depois = Date.now();

      expect(expiracao.getTime()).toBeGreaterThanOrEqual(antes + 60000);
      expect(expiracao.getTime()).toBeLessThanOrEqual(depois + 60000);
    });
  });

  describe('toString', () => {
    it('deve formatar segundos', () => {
      const ttl = TtlCache.criar(30);
      expect(ttl.toString()).toBe('30s');
    });

    it('deve formatar minutos', () => {
      const ttl = TtlCache.criar(300);
      expect(ttl.toString()).toBe('5m');
    });

    it('deve formatar horas', () => {
      const ttl = TtlCache.criar(7200);
      expect(ttl.toString()).toBe('2h');
    });
  });
});
