import { UsuarioRole } from './usuario-role.entity';

describe('UsuarioRole', () => {
  const propsValidas = {
    codUsuario: 42,
    roleId: 1,
    ativa: 'S',
    dataAtribuicao: new Date('2024-01-01'),
    dataExpiracao: undefined,
  };

  describe('criar', () => {
    it('deve criar UsuarioRole com dados válidos (permanente)', () => {
      const resultado = UsuarioRole.criar(propsValidas);

      expect(resultado.sucesso).toBe(true);
      const usuarioRole = resultado.obterValor();
      expect(usuarioRole.codUsuario).toBe(42);
      expect(usuarioRole.roleId).toBe(1);
      expect(usuarioRole.ativa).toBe(true);
      expect(usuarioRole.ehTemporaria()).toBe(false);
    });

    it('deve criar UsuarioRole temporária com data de expiração futura', () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const props = { ...propsValidas, dataExpiracao: dataFutura };
      const resultado = UsuarioRole.criar(props);

      expect(resultado.sucesso).toBe(true);
      const usuarioRole = resultado.obterValor();
      expect(usuarioRole.ehTemporaria()).toBe(true);
      expect(usuarioRole.expirou()).toBe(false);
    });

    it('deve falhar quando codUsuario inválido', () => {
      const props = { ...propsValidas, codUsuario: 0 };
      const resultado = UsuarioRole.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Código do usuário');
    });

    it('deve falhar quando roleId inválido', () => {
      const props = { ...propsValidas, roleId: 0 };
      const resultado = UsuarioRole.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('ID da role');
    });

    it('deve falhar quando data de expiração está no passado', () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      const props = { ...propsValidas, dataExpiracao: dataPassada };
      const resultado = UsuarioRole.criar(props);

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('data futura');
    });
  });

  describe('estaAtiva', () => {
    it('deve retornar true para associação ativa', () => {
      const usuarioRole = UsuarioRole.criar(propsValidas).obterValor();

      expect(usuarioRole.estaAtiva()).toBe(true);
    });

    it('deve retornar false para associação inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const usuarioRole = UsuarioRole.criar(props).obterValor();

      expect(usuarioRole.estaAtiva()).toBe(false);
    });
  });

  describe('expirou', () => {
    it('deve retornar false para associação permanente', () => {
      const usuarioRole = UsuarioRole.criar(propsValidas).obterValor();

      expect(usuarioRole.expirou()).toBe(false);
    });

    it('deve retornar false para associação com data futura', () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const props = { ...propsValidas, dataExpiracao: dataFutura };
      const usuarioRole = UsuarioRole.criar(props).obterValor();

      expect(usuarioRole.expirou()).toBe(false);
    });
  });

  describe('estaValida', () => {
    it('deve retornar true para associação ativa e não expirada', () => {
      const usuarioRole = UsuarioRole.criar(propsValidas).obterValor();

      expect(usuarioRole.estaValida()).toBe(true);
    });

    it('deve retornar false para associação inativa', () => {
      const props = { ...propsValidas, ativa: 'N' };
      const usuarioRole = UsuarioRole.criar(props).obterValor();

      expect(usuarioRole.estaValida()).toBe(false);
    });
  });

  describe('diasAteExpiracao', () => {
    it('deve retornar null para associação permanente', () => {
      const usuarioRole = UsuarioRole.criar(propsValidas).obterValor();

      expect(usuarioRole.diasAteExpiracao()).toBeNull();
    });

    it('deve retornar número de dias para associação temporária', () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 10);

      const props = { ...propsValidas, dataExpiracao: dataFutura };
      const usuarioRole = UsuarioRole.criar(props).obterValor();

      const dias = usuarioRole.diasAteExpiracao();
      expect(dias).toBeGreaterThanOrEqual(9);
      expect(dias).toBeLessThanOrEqual(11);
    });
  });

  describe('ehTemporaria', () => {
    it('deve retornar false para associação sem data de expiração', () => {
      const usuarioRole = UsuarioRole.criar(propsValidas).obterValor();

      expect(usuarioRole.ehTemporaria()).toBe(false);
    });

    it('deve retornar true para associação com data de expiração', () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const props = { ...propsValidas, dataExpiracao: dataFutura };
      const usuarioRole = UsuarioRole.criar(props).obterValor();

      expect(usuarioRole.ehTemporaria()).toBe(true);
    });
  });

  describe('equals', () => {
    it('deve retornar true para mesma combinação usuário-role', () => {
      const ur1 = UsuarioRole.criar(propsValidas).obterValor();
      const ur2 = UsuarioRole.criar(propsValidas).obterValor();

      expect(ur1.equals(ur2)).toBe(true);
    });

    it('deve retornar false para combinações diferentes', () => {
      const ur1 = UsuarioRole.criar(propsValidas).obterValor();
      const ur2 = UsuarioRole.criar({ ...propsValidas, roleId: 2 }).obterValor();

      expect(ur1.equals(ur2)).toBe(false);
    });
  });
});
