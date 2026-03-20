import { PermissaoEscrita } from './permissao-escrita.entity';

describe('PermissaoEscrita', () => {
  const propsValidas = {
    permissaoId: 1,
    tabela: 'TGFVEI',
    operacao: 'I',
    condicaoRLS: 'CODEMP = :codEmp',
    roleId: 10,
    codUsuario: null,
    ativa: 'S',
    descricao: 'Permissão de insert em veículos',
    requerAprovacao: 'N',
    dataValidade: null,
  };

  describe('criar', () => {
    it('deve criar PermissaoEscrita com dados válidos (via role)', () => {
      const resultado = PermissaoEscrita.criar(propsValidas);

      expect(resultado.sucesso).toBe(true);
      const permissao = resultado.obterValor();
      expect(permissao.permissaoId).toBe(1);
      expect(permissao.tabela).toBe('TGFVEI');
      expect(permissao.operacaoSigla).toBe('I');
      expect(permissao.roleId).toBe(10);
      expect(permissao.codUsuario).toBeNull();
      expect(permissao.ehPermissaoDeRole()).toBe(true);
    });

    it('deve criar PermissaoEscrita com dados válidos (direta ao usuário)', () => {
      const props = {
        ...propsValidas,
        roleId: null,
        codUsuario: 42,
      };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.sucesso).toBe(true);
      const permissao = resultado.obterValor();
      expect(permissao.codUsuario).toBe(42);
      expect(permissao.roleId).toBeNull();
      expect(permissao.ehPermissaoDireta()).toBe(true);
    });

    it('deve converter tabela para maiúsculas', () => {
      const props = { ...propsValidas, tabela: 'tgfvei' };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().tabela).toBe('TGFVEI');
    });

    it('deve falhar quando permissaoId inválido', () => {
      const props = { ...propsValidas, permissaoId: 0 };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('ID da permissão');
    });

    it('deve falhar quando tabela vazia', () => {
      const props = { ...propsValidas, tabela: '' };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('tabela');
    });

    it('deve falhar quando tabela com caracteres inválidos', () => {
      const props = { ...propsValidas, tabela: 'TAB-ELA' };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('caracteres inválidos');
    });

    it('deve falhar quando operação inválida', () => {
      const props = { ...propsValidas, operacao: 'X' };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Tipo de operação');
    });

    it('deve falhar quando não tem roleId nem codUsuario', () => {
      const props = { ...propsValidas, roleId: null, codUsuario: null };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('roleId ou codUsuario');
    });

    it('deve falhar quando tem roleId E codUsuario', () => {
      const props = { ...propsValidas, roleId: 10, codUsuario: 42 };
      const resultado = PermissaoEscrita.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('simultaneamente');
    });
  });

  describe('estaValida', () => {
    it('deve retornar true para permissão ativa sem data de validade', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.estaValida()).toBe(true);
    });

    it('deve retornar false para permissão inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.estaValida()).toBe(false);
    });

    it('deve retornar false para permissão expirada', () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      const props = { ...propsValidas, dataValidade: dataPassada };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.expirou()).toBe(true);
      expect(permissao.estaValida()).toBe(false);
    });

    it('deve retornar true para permissão com data futura', () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const props = { ...propsValidas, dataValidade: dataFutura };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.expirou()).toBe(false);
      expect(permissao.estaValida()).toBe(true);
    });
  });

  describe('aplicaA', () => {
    it('deve retornar true para tabela e operação corretas', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.aplicaA('TGFVEI', 'I')).toBe(true);
    });

    it('deve retornar false para tabela incorreta', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.aplicaA('OUTRA_TABELA', 'I')).toBe(false);
    });

    it('deve retornar false para operação incorreta', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.aplicaA('TGFVEI', 'U')).toBe(false);
    });

    it('deve aceitar tabela em minúsculas', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.aplicaA('tgfvei', 'I')).toBe(true);
    });
  });

  describe('condicaoRLS', () => {
    it('deve ter condição RLS quando fornecida', () => {
      const permissao = PermissaoEscrita.criar(propsValidas).obterValor();

      expect(permissao.possuiCondicaoRLS()).toBe(true);
      expect(permissao.condicaoRLS.valor).toBe('CODEMP = :codEmp');
    });

    it('deve não ter condição RLS quando vazia', () => {
      const props = { ...propsValidas, condicaoRLS: null };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.possuiCondicaoRLS()).toBe(false);
    });
  });

  describe('ehOperacaoEscrita', () => {
    it('deve retornar true para Insert', () => {
      const props = { ...propsValidas, operacao: 'I' };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.ehOperacaoEscrita()).toBe(true);
    });

    it('deve retornar true para Update', () => {
      const props = { ...propsValidas, operacao: 'U' };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.ehOperacaoEscrita()).toBe(true);
    });

    it('deve retornar true para Delete', () => {
      const props = { ...propsValidas, operacao: 'D' };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.ehOperacaoEscrita()).toBe(true);
    });

    it('deve retornar false para Select', () => {
      const props = { ...propsValidas, operacao: 'S' };
      const permissao = PermissaoEscrita.criar(props).obterValor();

      expect(permissao.ehOperacaoEscrita()).toBe(false);
    });
  });
});
