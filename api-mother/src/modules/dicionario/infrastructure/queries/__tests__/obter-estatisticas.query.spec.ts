/**
 * Testes para ObterEstatisticasQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterEstatisticasQuery } from '../obter-estatisticas.query';

describe('ObterEstatisticasQuery', () => {
  describe('construtor', () => {
    it('deve criar query sem parâmetros', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('SELECT');
      expect(query.parametros).toEqual({});
    });

    it('deve criar query com filtro de tabela', () => {
      const query = new ObterEstatisticasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('@nomeTabela');
      expect(query.parametros).toHaveProperty('nomeTabela', 'TGFPRO');
    });
  });

  describe('sql geral', () => {
    it('deve contar instâncias', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('totalInstancias');
      expect(query.sql).toContain('instanciasAtivas');
      expect(query.sql).toContain('instanciasInativas');
    });

    it('deve contar tabelas distintas', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('totalTabelas');
      expect(query.sql).toContain('DISTINCT NOMETAB');
    });

    it('deve contar campos', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('totalCampos');
      expect(query.sql).toContain('FROM TDDCAM');
    });

    it('deve contar relacionamentos', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('totalRelacionamentos');
      expect(query.sql).toContain('FROM TDDLIG');
    });

    it('deve calcular médias', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.sql).toContain('mediaCamposPorTabela');
      expect(query.sql).toContain('mediaFilhosPorInstancia');
    });

    it('deve aplicar filtro de ativos quando solicitado', () => {
      const query = new ObterEstatisticasQuery({ apenasAtivos: true });

      expect(query.sql).toContain("WHERE ATIVA = 'S'");
    });
  });

  describe('sql por tabela', () => {
    it('deve mostrar estatísticas específicas da tabela', () => {
      const query = new ObterEstatisticasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('camposChave');
      expect(query.sql).toContain('camposObrigatorios');
    });

    it('deve contar relacionamentos da tabela', () => {
      const query = new ObterEstatisticasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('totalFilhos');
      expect(query.sql).toContain('totalPais');
    });

    it('deve listar instâncias da tabela', () => {
      const query = new ObterEstatisticasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('listaInstancias');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabelas TDDINS, TDDCAM e TDDLIG', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toContain('TDDCAM');
      expect(query.tabelas).toContain('TDDLIG');
    });

    it('deve ter descrição', () => {
      const query = new ObterEstatisticasQuery();

      expect(query.descricao).toBeTruthy();
      expect(query.descricao).toContain('estatísticas');
    });
  });
});
