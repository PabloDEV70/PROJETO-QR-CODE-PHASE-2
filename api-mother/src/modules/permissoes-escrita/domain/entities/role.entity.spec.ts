import { Role } from './role.entity';

describe('Role', () => {
  const propsValidas = {
    roleId: 1,
    nome: 'ADMINISTRADOR',
    descricao: 'Role de administrador do sistema',
    ativa: 'S',
    dataCriacao: new Date('2024-01-01'),
    dataAtualizacao: new Date('2024-01-15'),
  };

  describe('criar', () => {
    it('deve criar Role com dados válidos', () => {
      const resultado = Role.criar(propsValidas);

      expect(resultado.sucesso).toBe(true);
      const role = resultado.obterValor();
      expect(role.roleId).toBe(1);
      expect(role.nome).toBe('ADMINISTRADOR');
      expect(role.descricao).toBe('Role de administrador do sistema');
      expect(role.ativa).toBe(true);
    });

    it('deve criar Role sem descrição', () => {
      const props = { ...propsValidas, descricao: undefined };
      const resultado = Role.criar(props);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().descricao).toBeNull();
    });

    it('deve criar Role inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const resultado = Role.criar(props);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().ativa).toBe(false);
      expect(resultado.obterValor().estaAtiva()).toBe(false);
    });

    it('deve falhar quando roleId inválido', () => {
      const props = { ...propsValidas, roleId: 0 };
      const resultado = Role.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('ID da role');
    });

    it('deve falhar quando nome vazio', () => {
      const props = { ...propsValidas, nome: '' };
      const resultado = Role.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Nome da role');
    });

    it('deve falhar quando nome muito longo', () => {
      const props = { ...propsValidas, nome: 'A'.repeat(101) };
      const resultado = Role.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('100 caracteres');
    });

    it('deve falhar quando descrição muito longa', () => {
      const props = { ...propsValidas, descricao: 'A'.repeat(501) };
      const resultado = Role.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('500 caracteres');
    });
  });

  describe('estaAtiva', () => {
    it('deve retornar true para role ativa', () => {
      const role = Role.criar(propsValidas).obterValor();

      expect(role.estaAtiva()).toBe(true);
    });

    it('deve retornar false para role inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const role = Role.criar(props).obterValor();

      expect(role.estaAtiva()).toBe(false);
    });
  });

  describe('podeSerAtribuida', () => {
    it('deve poder ser atribuída quando ativa', () => {
      const role = Role.criar(propsValidas).obterValor();

      expect(role.podeSerAtribuida()).toBe(true);
    });

    it('deve não poder ser atribuída quando inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const role = Role.criar(props).obterValor();

      expect(role.podeSerAtribuida()).toBe(false);
    });
  });

  describe('equals', () => {
    it('deve retornar true para roles com mesmo ID', () => {
      const role1 = Role.criar(propsValidas).obterValor();
      const role2 = Role.criar({ ...propsValidas, nome: 'OUTRO_NOME' }).obterValor();

      expect(role1.equals(role2)).toBe(true);
    });

    it('deve retornar false para roles com IDs diferentes', () => {
      const role1 = Role.criar(propsValidas).obterValor();
      const role2 = Role.criar({ ...propsValidas, roleId: 2 }).obterValor();

      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar string formatada', () => {
      const role = Role.criar(propsValidas).obterValor();

      expect(role.toString()).toBe('Role[1]: ADMINISTRADOR');
    });
  });
});
