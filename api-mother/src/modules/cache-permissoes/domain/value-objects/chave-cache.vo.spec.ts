/**
 * Testes unitarios para ChaveCache.
 *
 * @module M6 - Cache de Permissoes
 */

import { ChaveCache } from './chave-cache.vo';

describe('ChaveCache', () => {
  describe('criar', () => {
    it('deve criar chave com tipo e usuario', () => {
      const chave = ChaveCache.criar({
        tipo: 'permissao',
        codUsuario: 123,
      });

      expect(chave.valor).toBe('cache:permissao:user:123');
      expect(chave.tipo).toBe('permissao');
    });

    it('deve criar chave com recurso', () => {
      const chave = ChaveCache.criar({
        tipo: 'permissao',
        codUsuario: 123,
        recurso: 'tela:456',
      });

      expect(chave.valor).toBe('cache:permissao:user:123:recurso:tela:456');
    });

    it('deve criar chave com operacao', () => {
      const chave = ChaveCache.criar({
        tipo: 'permissao',
        codUsuario: 123,
        recurso: 'tela:456',
        operacao: 'READ',
      });

      expect(chave.valor).toBe('cache:permissao:user:123:recurso:tela:456:op:READ');
    });
  });

  describe('criarParaPermissao', () => {
    it('deve criar chave de permissao formatada', () => {
      const chave = ChaveCache.criarParaPermissao(123, 456, 'UPDATE');

      expect(chave.valor).toBe('cache:permissao:user:123:recurso:tela:456:op:UPDATE');
      expect(chave.tipo).toBe('permissao');
    });
  });

  describe('criarParaContexto', () => {
    it('deve criar chave de contexto', () => {
      const chave = ChaveCache.criarParaContexto(123);

      expect(chave.valor).toBe('cache:contexto:user:123');
      expect(chave.tipo).toBe('contexto');
    });
  });

  describe('criarParaParametro', () => {
    it('deve criar chave de parametro', () => {
      const chave = ChaveCache.criarParaParametro(123, 'CODEMP');

      expect(chave.valor).toBe('cache:parametro:user:123:recurso:CODEMP');
      expect(chave.tipo).toBe('parametro');
    });
  });

  describe('criarParaControle', () => {
    it('deve criar chave de controle', () => {
      const chave = ChaveCache.criarParaControle(123, 456, 'BTN_INSERIR');

      expect(chave.valor).toBe('cache:controle:user:123:recurso:tela:456:op:BTN_INSERIR');
      expect(chave.tipo).toBe('controle');
    });
  });

  describe('toString', () => {
    it('deve retornar o valor da chave', () => {
      const chave = ChaveCache.criarParaContexto(123);

      expect(chave.toString()).toBe('cache:contexto:user:123');
    });
  });

  describe('equals', () => {
    it('deve retornar true para chaves iguais', () => {
      const chave1 = ChaveCache.criarParaContexto(123);
      const chave2 = ChaveCache.criarParaContexto(123);

      expect(chave1.equals(chave2)).toBe(true);
    });

    it('deve retornar false para chaves diferentes', () => {
      const chave1 = ChaveCache.criarParaContexto(123);
      const chave2 = ChaveCache.criarParaContexto(456);

      expect(chave1.equals(chave2)).toBe(false);
    });

    it('deve retornar false para null', () => {
      const chave = ChaveCache.criarParaContexto(123);

      expect(chave.equals(null as any)).toBe(false);
    });
  });
});
