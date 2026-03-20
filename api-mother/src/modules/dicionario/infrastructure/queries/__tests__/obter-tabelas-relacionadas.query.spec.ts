/**
 * Testes para ObterTabelasRelacionadasQuery.
 *
 * @module Dicionário/Queries/Tests
 * @task D2-T19
 */

import { ObterTabelasRelacionadasQuery } from '../obter-tabelas-relacionadas.query';

describe('ObterTabelasRelacionadasQuery', () => {
  describe('construtor', () => {
    it('deve criar query com nome da tabela', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('WITH GrafoTabelas AS');
      expect(query.parametros).toHaveProperty('nomeTabela', 'TGFPRO');
    });

    it('deve lançar erro quando tabela é vazia', () => {
      expect(() => new ObterTabelasRelacionadasQuery({ nomeTabela: '' })).toThrow('Nome da tabela é obrigatório');
    });

    it('deve converter nome para maiúsculas', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'tgfpro' });

      expect(query.parametros.nomeTabela).toBe('TGFPRO');
    });
  });

  describe('sql', () => {
    it('deve usar CTE recursiva', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('WITH GrafoTabelas AS');
      expect(query.sql).toContain('UNION ALL');
    });

    it('deve navegar por filhos e pais', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      // Verifica navegação por filhos
      expect(query.sql).toContain('NOMEINSTANCIAFILHO');
      // Verifica navegação por pais
      expect(query.sql).toContain('NOMEINSTANCIAPAI');
    });

    it('deve evitar ciclos', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('CHARINDEX');
    });

    it('deve respeitar profundidade', () => {
      const query = new ObterTabelasRelacionadasQuery({
        nomeTabela: 'TGFPRO',
        profundidade: 3,
      });

      expect(query.sql).toContain('g.nivel < 3');
    });

    it('deve usar profundidade padrão 2', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('g.nivel < 2');
    });

    it('deve incluir filtro de ativos quando solicitado', () => {
      const query = new ObterTabelasRelacionadasQuery({
        nomeTabela: 'TGFPRO',
        apenasAtivos: true,
      });

      expect(query.sql).toContain("l.ATIVO = 'S'");
    });

    it('deve agrupar por tabela', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('GROUP BY tabela');
    });

    it('deve retornar métricas adicionais', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sql).toContain('quantidadeInstancias');
      expect(query.sql).toContain('quantidadeCampos');
    });
  });

  describe('sqlDetalhado', () => {
    it('deve retornar detalhes de relacionamentos', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sqlDetalhado).toContain('tabelaOrigem');
      expect(query.sqlDetalhado).toContain('tabelaDestino');
      expect(query.sqlDetalhado).toContain('tipoLigacao');
    });

    it('deve incluir direção do relacionamento', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sqlDetalhado).toContain("'FILHO' as direcao");
      expect(query.sqlDetalhado).toContain("'PAI' as direcao");
    });

    it('deve contar campos de link', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.sqlDetalhado).toContain('quantidadeCamposLink');
      expect(query.sqlDetalhado).toContain('TDDLGC');
    });
  });

  describe('metadata', () => {
    it('deve referenciar tabelas TDDINS, TDDLIG e TDDLGC', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.tabelas).toContain('TDDINS');
      expect(query.tabelas).toContain('TDDLIG');
      expect(query.tabelas).toContain('TDDLGC');
    });

    it('deve ter descrição', () => {
      const query = new ObterTabelasRelacionadasQuery({ nomeTabela: 'TGFPRO' });

      expect(query.descricao).toBeTruthy();
      expect(query.descricao).toContain('grafo');
    });
  });
});
