import { TipoOperacao } from './tipo-operacao.vo';

describe('TipoOperacao', () => {
  describe('criar', () => {
    it('deve criar TipoOperacao com valor válido I', () => {
      const resultado = TipoOperacao.criar('I');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('I');
      expect(resultado.obterValor().descricao).toBe('Insert');
    });

    it('deve criar TipoOperacao com valor válido U', () => {
      const resultado = TipoOperacao.criar('U');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('U');
      expect(resultado.obterValor().descricao).toBe('Update');
    });

    it('deve criar TipoOperacao com valor válido D', () => {
      const resultado = TipoOperacao.criar('D');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('D');
      expect(resultado.obterValor().descricao).toBe('Delete');
    });

    it('deve criar TipoOperacao com valor válido S', () => {
      const resultado = TipoOperacao.criar('S');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('S');
      expect(resultado.obterValor().descricao).toBe('Select');
    });

    it('deve aceitar minúsculas e converter para maiúsculas', () => {
      const resultado = TipoOperacao.criar('i');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('I');
    });

    it('deve falhar quando valor vazio', () => {
      const resultado = TipoOperacao.criar('');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('vazio');
    });

    it('deve falhar quando valor inválido', () => {
      const resultado = TipoOperacao.criar('X');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('inválido');
    });
  });

  describe('factory methods', () => {
    it('deve criar Insert via factory method', () => {
      const tipo = TipoOperacao.insert();

      expect(tipo.ehInsert()).toBe(true);
      expect(tipo.valor).toBe('I');
    });

    it('deve criar Update via factory method', () => {
      const tipo = TipoOperacao.update();

      expect(tipo.ehUpdate()).toBe(true);
      expect(tipo.valor).toBe('U');
    });

    it('deve criar Delete via factory method', () => {
      const tipo = TipoOperacao.delete();

      expect(tipo.ehDelete()).toBe(true);
      expect(tipo.valor).toBe('D');
    });

    it('deve criar Select via factory method', () => {
      const tipo = TipoOperacao.select();

      expect(tipo.ehSelect()).toBe(true);
      expect(tipo.valor).toBe('S');
    });
  });

  describe('ehEscrita e ehLeitura', () => {
    it('Insert deve ser escrita', () => {
      const tipo = TipoOperacao.insert();

      expect(tipo.ehEscrita()).toBe(true);
      expect(tipo.ehLeitura()).toBe(false);
    });

    it('Update deve ser escrita', () => {
      const tipo = TipoOperacao.update();

      expect(tipo.ehEscrita()).toBe(true);
      expect(tipo.ehLeitura()).toBe(false);
    });

    it('Delete deve ser escrita', () => {
      const tipo = TipoOperacao.delete();

      expect(tipo.ehEscrita()).toBe(true);
      expect(tipo.ehLeitura()).toBe(false);
    });

    it('Select deve ser leitura', () => {
      const tipo = TipoOperacao.select();

      expect(tipo.ehEscrita()).toBe(false);
      expect(tipo.ehLeitura()).toBe(true);
    });
  });

  describe('equals', () => {
    it('deve retornar true para tipos iguais', () => {
      const tipo1 = TipoOperacao.insert();
      const tipo2 = TipoOperacao.insert();

      expect(tipo1.equals(tipo2)).toBe(true);
    });

    it('deve retornar false para tipos diferentes', () => {
      const tipo1 = TipoOperacao.insert();
      const tipo2 = TipoOperacao.update();

      expect(tipo1.equals(tipo2)).toBe(false);
    });
  });
});
