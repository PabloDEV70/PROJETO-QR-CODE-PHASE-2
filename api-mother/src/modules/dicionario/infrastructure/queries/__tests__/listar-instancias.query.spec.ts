/**
 * Testes para ListarInstanciasQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ListarInstanciasQuery } from '../listar-instancias.query';

describe('ListarInstanciasQuery', () => {
  describe('construtor', () => {
    it('deve criar query sem filtros', () => {
      const query = new ListarInstanciasQuery();

      expect(query.sql).toContain('SELECT');
      expect(query.sql).toContain('FROM TDDINS');
      expect(query.parametros).toEqual({});
    });

    it('deve criar query com filtro de ativas', () => {
      const query = new ListarInstanciasQuery({ apenasAtivas: true });

      expect(query.sql).toContain("ATIVA = 'S'");
    });

    it('deve criar query com filtro de tabela', () => {
      const query = new ListarInstanciasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('NOMETAB = @nomeTabela');
      expect(query.parametros).toHaveProperty('nomeTabela', 'TGFPRO');
    });

    it('deve combinar múltiplos filtros', () => {
      const query = new ListarInstanciasQuery({
        apenasAtivas: true,
        nomeTabela: 'TGFPRO',
      });

      expect(query.sql).toContain("ATIVA = 'S'");
      expect(query.sql).toContain('NOMETAB = @nomeTabela');
      expect(query.sql).toContain('AND');
    });
  });

  describe('sql', () => {
    it('deve conter campos obrigatórios', () => {
      const query = new ListarInstanciasQuery();

      expect(query.sql).toContain('NOMEINSTANCIA');
      expect(query.sql).toContain('NOMETAB');
      expect(query.sql).toContain('DESCRICAO');
      expect(query.sql).toContain('ORDEM');
      expect(query.sql).toContain('ATIVA');
    });

    it('deve ordenar por tabela e ordem', () => {
      const query = new ListarInstanciasQuery();

      expect(query.sql).toContain('ORDER BY NOMETAB, ORDEM');
    });
  });

  describe('metadata', () => {
    it('deve listar tabelas consultadas', () => {
      const query = new ListarInstanciasQuery();

      expect(query.tabelas).toContain('TDDINS');
    });

    it('deve listar campos retornados', () => {
      const query = new ListarInstanciasQuery();

      expect(query.campos).toEqual(['NOMEINSTANCIA', 'NOMETAB', 'DESCRICAO', 'ORDEM', 'ATIVA']);
    });

    it('deve ter descrição', () => {
      const query = new ListarInstanciasQuery();

      expect(query.descricao).toBeTruthy();
      expect(query.descricao.length).toBeGreaterThan(10);
    });
  });
});
