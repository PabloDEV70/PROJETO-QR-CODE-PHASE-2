/**
 * Testes para ObterHierarquiaInstanciasQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterHierarquiaInstanciasQuery } from '../obter-hierarquia-instancias.query';

describe('ObterHierarquiaInstanciasQuery', () => {
  describe('construtor', () => {
    it('deve criar query para buscar filhos', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
      });

      expect(query.sql).toContain('WITH Hierarquia AS');
      expect(query.parametros).toHaveProperty('nomeInstanciaRaiz', 'Pedido');
    });

    it('deve criar query para buscar pais', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'ItemPedido',
        direcao: 'pais',
      });

      expect(query.sql).toContain('WITH Hierarquia AS');
      expect(query.descricao).toContain('pais');
    });

    it('deve lançar erro quando nome é vazio', () => {
      expect(
        () =>
          new ObterHierarquiaInstanciasQuery({
            nomeInstanciaRaiz: '',
            direcao: 'filhos',
          }),
      ).toThrow('Nome da instância raiz é obrigatório');
    });

    it('deve lançar erro quando direção é inválida', () => {
      expect(
        () =>
          new ObterHierarquiaInstanciasQuery({
            nomeInstanciaRaiz: 'Pedido',
            direcao: 'invalido' as any,
          }),
      ).toThrow("Direção deve ser 'filhos' ou 'pais'");
    });
  });

  describe('sql para filhos', () => {
    it('deve usar CTE recursiva', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
      });

      expect(query.sql).toContain('WITH Hierarquia AS');
      expect(query.sql).toContain('UNION ALL');
    });

    it('deve ter caso base e caso recursivo', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
      });

      expect(query.sql).toContain('-- Caso base');
      expect(query.sql).toContain('-- Caso recursivo');
    });

    it('deve respeitar profundidade máxima', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
        profundidadeMaxima: 5,
      });

      expect(query.sql).toContain('h.nivel < 5');
    });

    it('deve usar profundidade padrão 10', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
      });

      expect(query.sql).toContain('h.nivel < 10');
    });

    it('deve incluir filtro de ativos quando solicitado', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
        apenasAtivos: true,
      });

      expect(query.sql).toContain("l.ATIVO = 'S'");
    });
  });

  describe('sql para pais', () => {
    it('deve navegar por NOMEINSTANCIAFILHO', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'ItemPedido',
        direcao: 'pais',
      });

      expect(query.sql).toContain('NOMEINSTANCIAFILHO');
    });

    it('deve ordenar por nível e ordem', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'ItemPedido',
        direcao: 'pais',
      });

      expect(query.sql).toContain('ORDER BY nivel');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabelas TDDINS e TDDLIG', () => {
      const query = new ObterHierarquiaInstanciasQuery({
        nomeInstanciaRaiz: 'Pedido',
        direcao: 'filhos',
      });

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toContain('TDDLIG');
    });
  });
});
