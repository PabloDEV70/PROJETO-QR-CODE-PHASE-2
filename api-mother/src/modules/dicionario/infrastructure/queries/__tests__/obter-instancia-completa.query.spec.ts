/**
 * Testes para ObterInstanciaCompletaQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterInstanciaCompletaQuery } from '../obter-instancia-completa.query';

describe('ObterInstanciaCompletaQuery', () => {
  describe('construtor', () => {
    it('deve criar query com nome da instância', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('SELECT');
      expect(query.parametros).toHaveProperty('nomeInstancia', 'Produto');
    });

    it('deve lançar erro quando nome é vazio', () => {
      expect(() => new ObterInstanciaCompletaQuery({ nomeInstancia: '' })).toThrow('Nome da instância é obrigatório');
    });
  });

  describe('sql', () => {
    it('deve incluir instância principal', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain("'INSTANCIA' as tipo");
    });

    it('deve incluir filhos por padrão', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain("'FILHO' as tipo");
    });

    it('deve incluir pais por padrão', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain("'PAI' as tipo");
    });

    it('deve usar UNION ALL para combinar resultados', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('UNION ALL');
    });

    it('deve ordenar por tipo e ordem', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('ORDER BY tipo, ordem');
    });

    it('deve excluir filhos quando solicitado', () => {
      const query = new ObterInstanciaCompletaQuery({
        nomeInstancia: 'Produto',
        incluirFilhos: false,
      });

      expect(query.sql).not.toContain("'FILHO' as tipo");
      expect(query.sql).toContain("'PAI' as tipo");
    });

    it('deve excluir pais quando solicitado', () => {
      const query = new ObterInstanciaCompletaQuery({
        nomeInstancia: 'Produto',
        incluirPais: false,
      });

      expect(query.sql).toContain("'FILHO' as tipo");
      expect(query.sql).not.toContain("'PAI' as tipo");
    });
  });

  describe('sqlInstancia', () => {
    it('deve retornar query apenas da instância', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sqlInstancia).toContain('FROM TDDINS');
      expect(query.sqlInstancia).not.toContain('UNION');
    });
  });

  describe('sqlFilhos', () => {
    it('deve fazer JOIN com TDDLIG e TDDINS', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sqlFilhos).toContain('TDDLIG');
      expect(query.sqlFilhos).toContain('INNER JOIN TDDINS');
    });

    it('deve filtrar por instância pai', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sqlFilhos).toContain('NOMEINSTANCIAPAI');
    });
  });

  describe('sqlPais', () => {
    it('deve filtrar por instância filho', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.sqlPais).toContain('NOMEINSTANCIAFILHO');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabelas TDDINS e TDDLIG', () => {
      const query = new ObterInstanciaCompletaQuery({ nomeInstancia: 'Produto' });

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toContain('TDDLIG');
    });
  });
});
