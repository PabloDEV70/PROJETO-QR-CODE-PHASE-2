import { ControleUI } from './controle-ui.entity';

describe('ControleUI', () => {
  const dadosValidos = {
    codUsuario: 1,
    codTela: 100,
    nomeControle: 'btnSalvar',
    habilitado: 'S',
    visivel: 'S',
    obrigatorio: 'N',
    somenteLeitura: 'N',
  };

  describe('criar', () => {
    it('deve criar controle valido', () => {
      const resultado = ControleUI.criar(dadosValidos);

      expect(resultado.sucesso).toBe(true);
      const controle = resultado.obterValor();
      expect(controle.codUsuario).toBe(1);
      expect(controle.codTela).toBe(100);
      expect(controle.nomeControle).toBe('btnSalvar');
    });

    it('deve falhar quando codUsuario e invalido', () => {
      const resultado = ControleUI.criar({ ...dadosValidos, codUsuario: 0 });
      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('usuário');
    });

    it('deve falhar quando codTela e invalido', () => {
      const resultado = ControleUI.criar({ ...dadosValidos, codTela: -1 });
      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('tela');
    });

    it('deve falhar quando nomeControle e vazio', () => {
      const resultado = ControleUI.criar({ ...dadosValidos, nomeControle: '' });
      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('controle');
    });

    it('deve converter S/N para boolean', () => {
      const resultado = ControleUI.criar(dadosValidos);
      const controle = resultado.obterValor();

      expect(controle.habilitado).toBe(true);
      expect(controle.visivel).toBe(true);
      expect(controle.obrigatorio).toBe(false);
      expect(controle.somenteLeitura).toBe(false);
    });

    it('deve fazer trim no nomeControle', () => {
      const resultado = ControleUI.criar({
        ...dadosValidos,
        nomeControle: '  btnSalvar  ',
      });

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().nomeControle).toBe('btnSalvar');
    });

    it('deve converter habilitado para maiusculo antes de comparar', () => {
      const resultado = ControleUI.criar({
        ...dadosValidos,
        habilitado: 's',
      });

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().habilitado).toBe(true);
    });
  });

  describe('estaAcessivel', () => {
    it('deve retornar true quando habilitado E visivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'S',
        visivel: 'S',
      }).obterValor();

      expect(controle.estaAcessivel()).toBe(true);
    });

    it('deve retornar false quando desabilitado', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'N',
        visivel: 'S',
      }).obterValor();

      expect(controle.estaAcessivel()).toBe(false);
    });

    it('deve retornar false quando invisivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'S',
        visivel: 'N',
      }).obterValor();

      expect(controle.estaAcessivel()).toBe(false);
    });

    it('deve retornar false quando desabilitado e invisivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'N',
        visivel: 'N',
      }).obterValor();

      expect(controle.estaAcessivel()).toBe(false);
    });
  });

  describe('permiteEdicao', () => {
    it('deve retornar true quando habilitado e nao somente leitura', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'S',
        somenteLeitura: 'N',
      }).obterValor();

      expect(controle.permiteEdicao()).toBe(true);
    });

    it('deve retornar false quando somente leitura', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'S',
        somenteLeitura: 'S',
      }).obterValor();

      expect(controle.permiteEdicao()).toBe(false);
    });

    it('deve retornar false quando desabilitado', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'N',
        somenteLeitura: 'N',
      }).obterValor();

      expect(controle.permiteEdicao()).toBe(false);
    });

    it('deve retornar false quando desabilitado e somente leitura', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        habilitado: 'N',
        somenteLeitura: 'S',
      }).obterValor();

      expect(controle.permiteEdicao()).toBe(false);
    });
  });

  describe('requerPreenchimento', () => {
    it('deve retornar true quando obrigatorio e visivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        obrigatorio: 'S',
        visivel: 'S',
      }).obterValor();

      expect(controle.requerPreenchimento()).toBe(true);
    });

    it('deve retornar false quando obrigatorio mas invisivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        obrigatorio: 'S',
        visivel: 'N',
      }).obterValor();

      expect(controle.requerPreenchimento()).toBe(false);
    });

    it('deve retornar false quando nao obrigatorio e visivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        obrigatorio: 'N',
        visivel: 'S',
      }).obterValor();

      expect(controle.requerPreenchimento()).toBe(false);
    });

    it('deve retornar false quando nao obrigatorio e invisivel', () => {
      const controle = ControleUI.criar({
        ...dadosValidos,
        obrigatorio: 'N',
        visivel: 'N',
      }).obterValor();

      expect(controle.requerPreenchimento()).toBe(false);
    });
  });

  describe('equals', () => {
    it('deve comparar pela chave composta', () => {
      const controle1 = ControleUI.criar(dadosValidos).obterValor();
      const controle2 = ControleUI.criar(dadosValidos).obterValor();
      const controle3 = ControleUI.criar({
        ...dadosValidos,
        nomeControle: 'outro',
      }).obterValor();

      expect(controle1.equals(controle2)).toBe(true);
      expect(controle1.equals(controle3)).toBe(false);
    });

    it('deve retornar false quando comparado com null', () => {
      const controle = ControleUI.criar(dadosValidos).obterValor();
      expect(controle.equals(null as any)).toBe(false);
    });

    it('deve retornar false quando comparado com undefined', () => {
      const controle = ControleUI.criar(dadosValidos).obterValor();
      expect(controle.equals(undefined as any)).toBe(false);
    });

    it('deve retornar false quando codUsuario diferente', () => {
      const controle1 = ControleUI.criar(dadosValidos).obterValor();
      const controle2 = ControleUI.criar({
        ...dadosValidos,
        codUsuario: 2,
      }).obterValor();

      expect(controle1.equals(controle2)).toBe(false);
    });

    it('deve retornar false quando codTela diferente', () => {
      const controle1 = ControleUI.criar(dadosValidos).obterValor();
      const controle2 = ControleUI.criar({
        ...dadosValidos,
        codTela: 200,
      }).obterValor();

      expect(controle1.equals(controle2)).toBe(false);
    });
  });

  describe('propriedades opcionais', () => {
    it('deve criar controle com valores default para propriedades opcionais', () => {
      const resultado = ControleUI.criar({
        codUsuario: 1,
        codTela: 100,
        nomeControle: 'btnSalvar',
        habilitado: 'S',
        visivel: 'S',
      });

      expect(resultado.sucesso).toBe(true);
      const controle = resultado.obterValor();
      expect(controle.obrigatorio).toBe(false);
      expect(controle.somenteLeitura).toBe(false);
    });
  });
});
