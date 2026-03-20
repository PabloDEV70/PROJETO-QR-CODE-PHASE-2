/**
 * Testes para BuscarGlobalQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { BuscarGlobalQuery } from '../buscar-global.query';

describe('BuscarGlobalQuery', () => {
  describe('construtor', () => {
    it('deve criar query com termo válido', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.sql).toContain('SELECT');
      expect(query.parametros).toHaveProperty('termo', '%produto%');
    });

    it('deve lançar erro quando termo é muito curto', () => {
      expect(() => new BuscarGlobalQuery({ termo: 'a' })).toThrow('Termo de busca deve ter pelo menos 2 caracteres');
    });

    it('deve lançar erro quando termo é vazio', () => {
      expect(() => new BuscarGlobalQuery({ termo: '' })).toThrow('Termo de busca deve ter pelo menos 2 caracteres');
    });
  });

  describe('sql', () => {
    it('deve buscar em todos os tipos por padrão', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.sql).toContain("'INSTANCIA' as tipoResultado");
      expect(query.sql).toContain("'TABELA' as tipoResultado");
      expect(query.sql).toContain("'CAMPO' as tipoResultado");
    });

    it('deve usar UNION ALL para combinar resultados', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.sql).toContain('UNION ALL');
    });

    it('deve calcular relevância', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.sql).toContain('relevancia');
      expect(query.sql).toContain('CASE');
    });

    it('deve ordenar por relevância decrescente', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.sql).toContain('ORDER BY relevancia DESC');
    });

    it('deve buscar apenas nos tipos especificados', () => {
      const query = new BuscarGlobalQuery({
        termo: 'produto',
        tipos: ['instancia'],
      });

      expect(query.sql).toContain("'INSTANCIA' as tipoResultado");
      expect(query.sql).not.toContain("'TABELA' as tipoResultado");
      expect(query.sql).not.toContain("'CAMPO' as tipoResultado");
    });

    it('deve respeitar limite por tipo', () => {
      const query = new BuscarGlobalQuery({
        termo: 'produto',
        limitePorTipo: 10,
      });

      expect(query.sql).toContain('TOP 10');
    });
  });

  describe('parametros', () => {
    it('deve gerar variações do termo', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.parametros).toHaveProperty('termo', '%produto%');
      expect(query.parametros).toHaveProperty('termoExato', 'produto');
      expect(query.parametros).toHaveProperty('termoInicio', 'produto%');
    });

    it('deve remover espaços extras', () => {
      const query = new BuscarGlobalQuery({ termo: '  produto  ' });

      expect(query.parametros.termo).toBe('%produto%');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabelas TDDINS e TDDCAM', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toContain('TDDCAM');
    });

    it('deve ter descrição', () => {
      const query = new BuscarGlobalQuery({ termo: 'produto' });

      expect(query.descricao).toBeTruthy();
      expect(query.descricao).toContain('global');
    });
  });
});
