/**
 * Testes para ListarRelacionamentosQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ListarRelacionamentosQuery } from '../listar-relacionamentos.query';

describe('ListarRelacionamentosQuery', () => {
  describe('construtor', () => {
    it('deve criar query sem filtros', () => {
      const query = new ListarRelacionamentosQuery();

      expect(query.sql).toContain('SELECT');
      expect(query.sql).toContain('FROM TDDLIG');
      expect(query.parametros).toEqual({});
    });

    it('deve criar query com filtro de instância pai', () => {
      const query = new ListarRelacionamentosQuery({ nomeInstanciaPai: 'Pedido' });

      expect(query.sql).toContain('NOMEINSTANCIAPAI');
      expect(query.parametros).toHaveProperty('nomeInstanciaPai', 'Pedido');
    });

    it('deve criar query com filtro de instância filho', () => {
      const query = new ListarRelacionamentosQuery({ nomeInstanciaFilho: 'ItemPedido' });

      expect(query.sql).toContain('NOMEINSTANCIAFILHO');
      expect(query.parametros).toHaveProperty('nomeInstanciaFilho', 'ItemPedido');
    });

    it('deve criar query com filtro de tipo de ligação', () => {
      const query = new ListarRelacionamentosQuery({ tipoLigacao: 'D' });

      expect(query.sql).toContain('TIPOLIGACAO = @tipoLigacao');
      expect(query.parametros).toHaveProperty('tipoLigacao', 'D');
    });

    it('deve criar query com filtro de ativos', () => {
      const query = new ListarRelacionamentosQuery({ apenasAtivos: true });

      expect(query.sql).toContain("ATIVO = 'S'");
    });
  });

  describe('sql', () => {
    it('deve conter campos obrigatórios', () => {
      const query = new ListarRelacionamentosQuery();

      expect(query.sql).toContain('NOMEINSTANCIAPAI');
      expect(query.sql).toContain('NOMEINSTANCIAFILHO');
      expect(query.sql).toContain('TIPOLIGACAO');
      expect(query.sql).toContain('ORDEM');
      expect(query.sql).toContain('ATIVO');
    });

    it('deve ordenar por instância pai e ordem', () => {
      const query = new ListarRelacionamentosQuery();

      expect(query.sql).toContain('ORDER BY NOMEINSTANCIAPAI, ORDEM');
    });

    it('deve usar UPPER para busca case-insensitive', () => {
      const query = new ListarRelacionamentosQuery({ nomeInstanciaPai: 'Pedido' });

      expect(query.sql).toContain('UPPER(NOMEINSTANCIAPAI)');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabela TDDLIG', () => {
      const query = new ListarRelacionamentosQuery();

      expect(query.tabelas).toContain('TDDLIG');
      expect(query.tabelas).toHaveLength(1);
    });

    it('deve listar campos retornados', () => {
      const query = new ListarRelacionamentosQuery();

      expect(query.campos).toEqual(['NOMEINSTANCIAPAI', 'NOMEINSTANCIAFILHO', 'TIPOLIGACAO', 'ORDEM', 'ATIVO']);
    });
  });
});
