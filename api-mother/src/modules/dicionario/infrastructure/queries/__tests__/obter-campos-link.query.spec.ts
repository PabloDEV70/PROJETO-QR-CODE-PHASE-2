/**
 * Testes para ObterCamposLinkQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterCamposLinkQuery } from '../obter-campos-link.query';

describe('ObterCamposLinkQuery', () => {
  describe('construtor', () => {
    it('deve criar query com parâmetros válidos', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.sql).toContain('SELECT');
      expect(query.sql).toContain('FROM TDDLGC');
      expect(query.parametros).toHaveProperty('nomeInstanciaPai', 'Pedido');
      expect(query.parametros).toHaveProperty('nomeInstanciaFilho', 'ItemPedido');
    });

    it('deve lançar erro quando instância pai é vazia', () => {
      expect(
        () =>
          new ObterCamposLinkQuery({
            nomeInstanciaPai: '',
            nomeInstanciaFilho: 'ItemPedido',
          }),
      ).toThrow('Nome da instância pai é obrigatório');
    });

    it('deve lançar erro quando instância filho é vazia', () => {
      expect(
        () =>
          new ObterCamposLinkQuery({
            nomeInstanciaPai: 'Pedido',
            nomeInstanciaFilho: '',
          }),
      ).toThrow('Nome da instância filho é obrigatório');
    });
  });

  describe('sql', () => {
    it('deve conter campos obrigatórios', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.sql).toContain('CAMPOORIGEM');
      expect(query.sql).toContain('CAMPODESTINO');
      expect(query.sql).toContain('ORDEM');
    });

    it('deve filtrar por ambas instâncias', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.sql).toContain('NOMEINSTANCIAPAI');
      expect(query.sql).toContain('NOMEINSTANCIAFILHO');
    });

    it('deve ordenar por ordem', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.sql).toContain('ORDER BY ORDEM');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabela TDDLGC', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.tabelas).toContain('TDDLGC');
      expect(query.tabelas).toHaveLength(1);
    });

    it('deve listar campos retornados', () => {
      const query = new ObterCamposLinkQuery({
        nomeInstanciaPai: 'Pedido',
        nomeInstanciaFilho: 'ItemPedido',
      });

      expect(query.campos).toContain('CAMPOORIGEM');
      expect(query.campos).toContain('CAMPODESTINO');
    });
  });
});
