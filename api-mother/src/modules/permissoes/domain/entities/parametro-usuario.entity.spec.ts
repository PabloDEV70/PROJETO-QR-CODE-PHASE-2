import { ParametroUsuario } from './parametro-usuario.entity';

describe('ParametroUsuario', () => {
  describe('criar', () => {
    it('deve criar parametro valido', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'MOSTRA_GRID',
        valor: 'S',
        tipo: 'B',
      });

      expect(resultado.sucesso).toBe(true);
      const param = resultado.obterValor();
      expect(param.chave).toBe('MOSTRA_GRID');
      expect(param.valor).toBe('S');
    });

    it('deve converter chave para maiusculo', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'mostra_grid',
        valor: 'S',
      });

      expect(resultado.obterValor().chave).toBe('MOSTRA_GRID');
    });

    it('deve usar tipo S como default', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'texto',
      });

      expect(resultado.obterValor().tipo).toBe('S');
    });

    it('deve falhar quando codUsuario e invalido', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 0,
        chave: 'PARAM',
        valor: 'S',
      });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('usuário');
    });

    it('deve falhar quando chave e vazia', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: '',
        valor: 'S',
      });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Chave');
    });

    it('deve falhar quando valor e null', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: null as any,
      });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Valor');
    });

    it('deve falhar quando valor e undefined', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: undefined as any,
      });

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('Valor');
    });

    it('deve fazer trim na chave', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: '  PARAM  ',
        valor: 'S',
      });

      expect(resultado.obterValor().chave).toBe('PARAM');
    });

    it('deve fazer trim na descricao', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'S',
        descricao: '  Descricao do parametro  ',
      });

      expect(resultado.obterValor().descricao).toBe('Descricao do parametro');
    });

    it('deve aceitar tipo N', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'LIMITE',
        valor: '100',
        tipo: 'N',
      });

      expect(resultado.obterValor().tipo).toBe('N');
    });

    it('deve aceitar tipo B', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'ATIVO',
        valor: 'S',
        tipo: 'B',
      });

      expect(resultado.obterValor().tipo).toBe('B');
    });

    it('deve converter tipo para maiusculo', () => {
      const resultado = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'S',
        tipo: 'b',
      });

      expect(resultado.obterValor().tipo).toBe('B');
    });
  });

  describe('obterValorBooleano', () => {
    it.each(['S', '1', 'true'])('deve retornar true para %s', (valor) => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor,
        tipo: 'B',
      }).obterValor();

      expect(param.obterValorBooleano()).toBe(true);
    });

    it.each(['N', '0', 'false', ''])('deve retornar false para %s', (valor) => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor,
        tipo: 'B',
      }).obterValor();

      expect(param.obterValorBooleano()).toBe(false);
    });

    it('deve retornar false para tipo nao booleano', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'S',
        tipo: 'S',
      }).obterValor();

      expect(param.obterValorBooleano()).toBe(false);
    });

    it('deve retornar false para tipo numerico', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: '1',
        tipo: 'N',
      }).obterValor();

      expect(param.obterValorBooleano()).toBe(false);
    });
  });

  describe('obterValorNumerico', () => {
    it('deve converter string para numero', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'LIMITE',
        valor: '100',
        tipo: 'N',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(100);
    });

    it('deve retornar 0 para valor invalido', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'LIMITE',
        valor: 'abc',
        tipo: 'N',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(0);
    });

    it('deve retornar 0 para tipo nao numerico', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: '100',
        tipo: 'S',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(0);
    });

    it('deve retornar 0 para tipo booleano', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: '100',
        tipo: 'B',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(0);
    });

    it('deve converter numero decimal', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'LIMITE',
        valor: '99.99',
        tipo: 'N',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(99.99);
    });

    it('deve converter numero negativo', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'LIMITE',
        valor: '-50',
        tipo: 'N',
      }).obterValor();

      expect(param.obterValorNumerico()).toBe(-50);
    });
  });

  describe('estaAtivo', () => {
    it('deve retornar true quando valor booleano e true', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'ATIVO',
        valor: 'S',
        tipo: 'B',
      }).obterValor();

      expect(param.estaAtivo()).toBe(true);
    });

    it('deve retornar false quando valor booleano e false', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'ATIVO',
        valor: 'N',
        tipo: 'B',
      }).obterValor();

      expect(param.estaAtivo()).toBe(false);
    });

    it('deve retornar false quando tipo nao e booleano', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'S',
        tipo: 'S',
      }).obterValor();

      expect(param.estaAtivo()).toBe(false);
    });
  });

  describe('equals', () => {
    it('deve comparar pela chave composta (codUsuario + chave)', () => {
      const param1 = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'A',
      }).obterValor();

      const param2 = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'B',
      }).obterValor();

      expect(param1.equals(param2)).toBe(true);
    });

    it('deve retornar false quando codUsuario diferente', () => {
      const param1 = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'A',
      }).obterValor();

      const param2 = ParametroUsuario.criar({
        codUsuario: 2,
        chave: 'PARAM',
        valor: 'A',
      }).obterValor();

      expect(param1.equals(param2)).toBe(false);
    });

    it('deve retornar false quando chave diferente', () => {
      const param1 = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM1',
        valor: 'A',
      }).obterValor();

      const param2 = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM2',
        valor: 'A',
      }).obterValor();

      expect(param1.equals(param2)).toBe(false);
    });

    it('deve retornar false quando comparado com null', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'A',
      }).obterValor();

      expect(param.equals(null as any)).toBe(false);
    });

    it('deve retornar false quando comparado com undefined', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'A',
      }).obterValor();

      expect(param.equals(undefined as any)).toBe(false);
    });
  });

  describe('getters', () => {
    it('deve retornar codUsuario corretamente', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 42,
        chave: 'PARAM',
        valor: 'teste',
      }).obterValor();

      expect(param.codUsuario).toBe(42);
    });

    it('deve retornar descricao quando definida', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'teste',
        descricao: 'Minha descricao',
      }).obterValor();

      expect(param.descricao).toBe('Minha descricao');
    });

    it('deve retornar undefined para descricao nao definida', () => {
      const param = ParametroUsuario.criar({
        codUsuario: 1,
        chave: 'PARAM',
        valor: 'teste',
      }).obterValor();

      expect(param.descricao).toBeUndefined();
    });
  });
});
