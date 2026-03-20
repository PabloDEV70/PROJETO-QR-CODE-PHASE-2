import { ResumoDatabase } from './resumo-database.entity';

describe('ResumoDatabase Entity', () => {
  const dadosBase = {
    total_tables: 150,
    total_views: 45,
    total_triggers: 20,
    total_procedures: 80,
    total_size_mb: 1024,
    data_size_mb: 800,
    index_size_mb: 200,
    unused_size_mb: 24,
  };

  describe('criar', () => {
    it('deve criar um resumo do banco', () => {
      const resumo = ResumoDatabase.criar(dadosBase);

      expect(resumo.totalTabelas).toBe(150);
      expect(resumo.totalViews).toBe(45);
      expect(resumo.totalTriggers).toBe(20);
      expect(resumo.totalProcedures).toBe(80);
      expect(resumo.tamanhoTotalMb).toBe(1024);
      expect(resumo.tamanhoDadosMb).toBe(800);
      expect(resumo.tamanhoIndicesMb).toBe(200);
      expect(resumo.tamanhoNaoUsadoMb).toBe(24);
    });
  });

  describe('obterPorcentagemUtilizada', () => {
    it('deve calcular porcentagem utilizada', () => {
      const resumo = ResumoDatabase.criar(dadosBase);
      expect(resumo.obterPorcentagemUtilizada()).toBe(98);
    });

    it('deve retornar 0 quando tamanho total é 0', () => {
      const resumo = ResumoDatabase.criar({
        ...dadosBase,
        total_size_mb: 0,
      });
      expect(resumo.obterPorcentagemUtilizada()).toBe(0);
    });
  });

  describe('temMuitosObjetos', () => {
    it('deve retornar false para banco normal', () => {
      const resumo = ResumoDatabase.criar(dadosBase);
      expect(resumo.temMuitosObjetos()).toBe(false);
    });

    it('deve retornar true para banco com muitos objetos', () => {
      const resumo = ResumoDatabase.criar({
        ...dadosBase,
        total_tables: 500,
        total_views: 300,
        total_triggers: 100,
        total_procedures: 200,
      });
      expect(resumo.temMuitosObjetos()).toBe(true);
    });
  });

  describe('obterEstatisticasFormatadas', () => {
    it('deve retornar estatísticas formatadas', () => {
      const resumo = ResumoDatabase.criar(dadosBase);
      const stats = resumo.obterEstatisticasFormatadas();

      expect(stats.tabelas).toBe('150 tabelas');
      expect(stats.views).toBe('45 views');
      expect(stats.triggers).toBe('20 triggers');
      expect(stats.procedures).toBe('80 procedures');
      expect(stats.tamanhoTotal).toBe('1024.00 MB');
    });
  });
});
