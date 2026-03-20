/**
 * Testes para ObterInstanciaQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterInstanciaQuery } from '../obter-instancia.query';

describe('ObterInstanciaQuery', () => {
  describe('construtor', () => {
    it('deve criar query com nome da instância', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('SELECT');
      expect(query.sql).toContain('FROM TDDINS');
      expect(query.parametros).toHaveProperty('nomeInstancia', 'Produto');
    });

    it('deve remover espaços do nome', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: '  Produto  ' });

      expect(query.parametros.nomeInstancia).toBe('Produto');
    });

    it('deve lançar erro quando nome é vazio', () => {
      expect(() => new ObterInstanciaQuery({ nomeInstancia: '' })).toThrow('Nome da instância é obrigatório');
    });

    it('deve lançar erro quando nome é apenas espaços', () => {
      expect(() => new ObterInstanciaQuery({ nomeInstancia: '   ' })).toThrow('Nome da instância é obrigatório');
    });
  });

  describe('sql', () => {
    it('deve usar UPPER para busca case-insensitive', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('UPPER(NOMEINSTANCIA) = UPPER(@nomeInstancia)');
    });

    it('deve conter campos obrigatórios', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });

      expect(query.sql).toContain('NOMEINSTANCIA');
      expect(query.sql).toContain('NOMETAB');
      expect(query.sql).toContain('DESCRICAO');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabela TDDINS', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toHaveLength(1);
    });

    it('deve ter descrição', () => {
      const query = new ObterInstanciaQuery({ nomeInstancia: 'Produto' });

      expect(query.descricao).toBeTruthy();
    });
  });
});
