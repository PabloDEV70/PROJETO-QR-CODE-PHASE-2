import { EstatisticasCache } from './estatisticas-cache.entity';

describe('EstatisticasCache Entity', () => {
  const dadosBase = {
    hits: 150,
    misses: 25,
    keys: 45,
    ksize: 2048,
    vsize: 102400,
  };

  describe('criar', () => {
    it('deve criar estatísticas de cache', () => {
      const stats = EstatisticasCache.criar(dadosBase);

      expect(stats.acertos).toBe(150);
      expect(stats.erros).toBe(25);
      expect(stats.chaves).toBe(45);
      expect(stats.tamanhoChaves).toBe(2048);
      expect(stats.tamanhoValores).toBe(102400);
    });
  });

  describe('obterTaxaAcerto', () => {
    it('deve calcular taxa de acerto', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      expect(stats.obterTaxaAcerto()).toBe(86); // 150/175 = 0.857 -> 86%
    });

    it('deve retornar 0 quando não há requisições', () => {
      const stats = EstatisticasCache.criar({
        ...dadosBase,
        hits: 0,
        misses: 0,
      });
      expect(stats.obterTaxaAcerto()).toBe(0);
    });
  });

  describe('obterTamanhoTotal', () => {
    it('deve calcular tamanho total', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      expect(stats.obterTamanhoTotal()).toBe(104448); // 2048 + 102400
    });
  });

  describe('obterTamanhoFormatado', () => {
    it('deve formatar em KB quando menor que 1MB', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      expect(stats.obterTamanhoFormatado()).toBe('102.00 KB');
    });

    it('deve formatar em bytes quando menor que 1KB', () => {
      const stats = EstatisticasCache.criar({
        ...dadosBase,
        ksize: 100,
        vsize: 200,
      });
      expect(stats.obterTamanhoFormatado()).toBe('300 B');
    });

    it('deve formatar em MB quando maior que 1MB', () => {
      const stats = EstatisticasCache.criar({
        ...dadosBase,
        ksize: 512 * 1024,
        vsize: 1024 * 1024,
      });
      expect(stats.obterTamanhoFormatado()).toBe('1.50 MB');
    });
  });

  describe('estaEficiente', () => {
    it('deve retornar true quando taxa >= 70%', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      expect(stats.estaEficiente()).toBe(true);
    });

    it('deve retornar false quando taxa < 70%', () => {
      const stats = EstatisticasCache.criar({
        ...dadosBase,
        hits: 50,
        misses: 50,
      });
      expect(stats.estaEficiente()).toBe(false);
    });
  });

  describe('estaVazio', () => {
    it('deve retornar false quando tem chaves', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      expect(stats.estaVazio()).toBe(false);
    });

    it('deve retornar true quando não tem chaves', () => {
      const stats = EstatisticasCache.criar({
        ...dadosBase,
        keys: 0,
      });
      expect(stats.estaVazio()).toBe(true);
    });
  });

  describe('obterResumo', () => {
    it('deve retornar resumo das estatísticas', () => {
      const stats = EstatisticasCache.criar(dadosBase);
      const resumo = stats.obterResumo();

      expect(resumo.taxaAcerto).toBe('86%');
      expect(resumo.totalRequisicoes).toBe(175);
      expect(resumo.chavesArmazenadas).toBe(45);
      expect(resumo.eficiente).toBe('Sim');
    });
  });
});
