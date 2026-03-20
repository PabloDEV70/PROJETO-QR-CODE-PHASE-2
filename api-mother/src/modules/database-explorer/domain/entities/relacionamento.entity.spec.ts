import { Relacionamento } from './relacionamento.entity';

describe('Relacionamento Entity', () => {
  const dadosBase = {
    constraint_name: 'FK_Veiculo_Parceiro',
    parent_schema: 'dbo',
    parent_table: 'TGFVEI',
    parent_column: 'CODPARC',
    referenced_schema: 'dbo',
    referenced_table: 'TGFPAR',
    referenced_column: 'CODPARC',
    delete_rule: 'NO ACTION',
    update_rule: 'CASCADE',
  };

  describe('criar', () => {
    it('deve criar um relacionamento', () => {
      const rel = Relacionamento.criar(dadosBase);

      expect(rel.nomeConstraint).toBe('FK_Veiculo_Parceiro');
      expect(rel.schemaPai).toBe('dbo');
      expect(rel.tabelaPai).toBe('TGFVEI');
      expect(rel.colunaPai).toBe('CODPARC');
      expect(rel.schemaReferenciado).toBe('dbo');
      expect(rel.tabelaReferenciada).toBe('TGFPAR');
      expect(rel.colunaReferenciada).toBe('CODPARC');
      expect(rel.regraDelete).toBe('NO ACTION');
      expect(rel.regraUpdate).toBe('CASCADE');
    });
  });

  describe('obterTabelaPaiCompleta', () => {
    it('deve retornar tabela pai completa', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.obterTabelaPaiCompleta()).toBe('dbo.TGFVEI');
    });
  });

  describe('obterTabelaReferenciadaCompleta', () => {
    it('deve retornar tabela referenciada completa', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.obterTabelaReferenciadaCompleta()).toBe('dbo.TGFPAR');
    });
  });

  describe('temCascadeDelete', () => {
    it('deve retornar false quando não tem cascade', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.temCascadeDelete()).toBe(false);
    });

    it('deve retornar true quando tem cascade', () => {
      const rel = Relacionamento.criar({
        ...dadosBase,
        delete_rule: 'CASCADE',
      });
      expect(rel.temCascadeDelete()).toBe(true);
    });
  });

  describe('temCascadeUpdate', () => {
    it('deve retornar true quando tem cascade', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.temCascadeUpdate()).toBe(true);
    });
  });

  describe('obterDescricao', () => {
    it('deve retornar descrição do relacionamento', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.obterDescricao()).toBe('dbo.TGFVEI.CODPARC -> dbo.TGFPAR.CODPARC');
    });
  });

  describe('ehAutoReferenciado', () => {
    it('deve retornar false quando não é auto-referenciado', () => {
      const rel = Relacionamento.criar(dadosBase);
      expect(rel.ehAutoReferenciado()).toBe(false);
    });

    it('deve retornar true quando é auto-referenciado', () => {
      const rel = Relacionamento.criar({
        ...dadosBase,
        referenced_table: 'TGFVEI',
      });
      expect(rel.ehAutoReferenciado()).toBe(true);
    });
  });
});
