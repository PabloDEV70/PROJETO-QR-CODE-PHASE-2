import { Tabela } from './tabela.entity';

describe('Tabela', () => {
  describe('criar', () => {
    it('deve criar tabela valida com dados minimos', () => {
      const resultado = Tabela.criar({ nomeTabela: 'TGFPRO' });

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().nomeTabela).toBe('TGFPRO');
    });

    it('deve criar tabela com todos os campos', () => {
      const resultado = Tabela.criar({
        nomeTabela: 'TGFPRO',
        descricao: 'Produtos',
        nomeInstancia: 'Produto',
        modulo: 'COM',
        ativa: 'S',
        tipoCrud: 'CRUD',
      });

      expect(resultado.sucesso).toBe(true);
      const tabela = resultado.obterValor();
      expect(tabela.descricao).toBe('Produtos');
      expect(tabela.modulo).toBe('COM');
      expect(tabela.ativa).toBe(true);
    });

    it('deve falhar quando nome da tabela e vazio', () => {
      const resultado = Tabela.criar({ nomeTabela: '' });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('vazio');
    });

    it('deve converter nome da tabela para maiusculo', () => {
      const resultado = Tabela.criar({ nomeTabela: 'tgfpro' });

      expect(resultado.obterValor().nomeTabela).toBe('TGFPRO');
    });

    it('deve usar nomeTabela como nomeInstancia quando nao informado', () => {
      const resultado = Tabela.criar({ nomeTabela: 'TGFPRO' });

      expect(resultado.obterValor().nomeInstancia).toBe('TGFPRO');
    });

    it('deve usar tipoCrud padrao CRUD quando nao informado', () => {
      const resultado = Tabela.criar({ nomeTabela: 'TGFPRO' });

      expect(resultado.obterValor().tipoCrud).toBe('CRUD');
    });

    it('deve tratar espacos em branco no nome da tabela', () => {
      const resultado = Tabela.criar({ nomeTabela: '  tgfpro  ' });

      expect(resultado.obterValor().nomeTabela).toBe('TGFPRO');
    });

    it('deve falhar quando nome da tabela contem apenas espacos', () => {
      const resultado = Tabela.criar({ nomeTabela: '   ' });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('vazio');
    });
  });

  describe('estaAtiva', () => {
    it('deve retornar true quando ativa e S', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO', ativa: 'S' }).obterValor();
      expect(tabela.estaAtiva()).toBe(true);
    });

    it('deve retornar false quando ativa e N', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO', ativa: 'N' }).obterValor();
      expect(tabela.estaAtiva()).toBe(false);
    });

    it('deve retornar true quando ativa nao e informado (padrao)', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      expect(tabela.estaAtiva()).toBe(true);
    });

    it('deve tratar ativa em minusculo', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO', ativa: 'n' }).obterValor();
      expect(tabela.estaAtiva()).toBe(false);
    });
  });

  describe('ehSistema', () => {
    it('deve retornar true para tabelas TSI', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TSIUSU' }).obterValor();
      expect(tabela.ehSistema()).toBe(true);
    });

    it('deve retornar true para tabelas TDD', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TDDTAB' }).obterValor();
      expect(tabela.ehSistema()).toBe(true);
    });

    it('deve retornar false para tabelas de negocio', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      expect(tabela.ehSistema()).toBe(false);
    });

    it('deve retornar false para tabelas TGF', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPAR' }).obterValor();
      expect(tabela.ehSistema()).toBe(false);
    });

    it('deve retornar false para tabelas TCF', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TCFOSCAB' }).obterValor();
      expect(tabela.ehSistema()).toBe(false);
    });
  });

  describe('equals', () => {
    it('deve retornar true para tabelas com mesmo nome', () => {
      const tabela1 = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      const tabela2 = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      expect(tabela1.equals(tabela2)).toBe(true);
    });

    it('deve retornar false para tabelas com nomes diferentes', () => {
      const tabela1 = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      const tabela2 = Tabela.criar({ nomeTabela: 'TGFPAR' }).obterValor();
      expect(tabela1.equals(tabela2)).toBe(false);
    });

    it('deve retornar false quando comparando com null', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      expect(tabela.equals(null as any)).toBe(false);
    });

    it('deve retornar false quando comparando com undefined', () => {
      const tabela = Tabela.criar({ nomeTabela: 'TGFPRO' }).obterValor();
      expect(tabela.equals(undefined as any)).toBe(false);
    });
  });

  describe('getters', () => {
    it('deve retornar todos os valores corretamente', () => {
      const tabela = Tabela.criar({
        nomeTabela: 'TGFPRO',
        descricao: 'Produtos',
        nomeInstancia: 'Produto',
        modulo: 'COM',
        ativa: 'S',
        tipoCrud: 'CONSULTA',
      }).obterValor();

      expect(tabela.nomeTabela).toBe('TGFPRO');
      expect(tabela.descricao).toBe('Produtos');
      expect(tabela.nomeInstancia).toBe('Produto');
      expect(tabela.modulo).toBe('COM');
      expect(tabela.ativa).toBe(true);
      expect(tabela.tipoCrud).toBe('CONSULTA');
    });
  });
});
