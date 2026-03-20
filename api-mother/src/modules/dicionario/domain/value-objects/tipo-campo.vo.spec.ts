import { TipoCampo } from './tipo-campo.vo';

describe('TipoCampo', () => {
  describe('criar', () => {
    it.each(['S', 'I', 'F', 'D', 'H', 'B', 'C'])('deve criar tipo valido: %s', (tipo) => {
      const resultado = TipoCampo.criar(tipo);
      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe(tipo);
    });

    it('deve aceitar minusculas e converter para maiusculas', () => {
      const resultado = TipoCampo.criar('s');
      expect(resultado.obterValor().valor).toBe('S');
    });

    it('deve falhar para tipo invalido', () => {
      const resultado = TipoCampo.criar('X');
      expect(resultado.falhou).toBe(true);
    });

    it('deve falhar para tipo vazio', () => {
      const resultado = TipoCampo.criar('');
      expect(resultado.falhou).toBe(true);
    });

    it('deve falhar para tipo null', () => {
      const resultado = TipoCampo.criar(null as any);
      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('vazio');
    });

    it('deve falhar para tipo undefined', () => {
      const resultado = TipoCampo.criar(undefined as any);
      expect(resultado.falhou).toBe(true);
    });

    it.each(['s', 'i', 'f', 'd', 'h', 'b', 'c'])('deve converter minuscula %s para maiuscula', (tipo) => {
      const resultado = TipoCampo.criar(tipo);
      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe(tipo.toUpperCase());
    });
  });

  describe('metodos de verificacao', () => {
    it('ehTexto deve retornar true para S e C', () => {
      expect(TipoCampo.criar('S').obterValor().ehTexto()).toBe(true);
      expect(TipoCampo.criar('C').obterValor().ehTexto()).toBe(true);
      expect(TipoCampo.criar('I').obterValor().ehTexto()).toBe(false);
    });

    it('ehNumerico deve retornar true para I e F', () => {
      expect(TipoCampo.criar('I').obterValor().ehNumerico()).toBe(true);
      expect(TipoCampo.criar('F').obterValor().ehNumerico()).toBe(true);
      expect(TipoCampo.criar('S').obterValor().ehNumerico()).toBe(false);
    });

    it('ehData deve retornar true apenas para D', () => {
      expect(TipoCampo.criar('D').obterValor().ehData()).toBe(true);
      expect(TipoCampo.criar('S').obterValor().ehData()).toBe(false);
    });

    it('ehBooleano deve retornar true apenas para B', () => {
      expect(TipoCampo.criar('B').obterValor().ehBooleano()).toBe(true);
      expect(TipoCampo.criar('S').obterValor().ehBooleano()).toBe(false);
    });

    it('ehHora deve retornar true apenas para H', () => {
      expect(TipoCampo.criar('H').obterValor().ehHora()).toBe(true);
      expect(TipoCampo.criar('S').obterValor().ehHora()).toBe(false);
    });

    it('ehTexto deve retornar false para tipos nao-texto', () => {
      expect(TipoCampo.criar('I').obterValor().ehTexto()).toBe(false);
      expect(TipoCampo.criar('F').obterValor().ehTexto()).toBe(false);
      expect(TipoCampo.criar('D').obterValor().ehTexto()).toBe(false);
      expect(TipoCampo.criar('H').obterValor().ehTexto()).toBe(false);
      expect(TipoCampo.criar('B').obterValor().ehTexto()).toBe(false);
    });

    it('ehNumerico deve retornar false para tipos nao-numericos', () => {
      expect(TipoCampo.criar('S').obterValor().ehNumerico()).toBe(false);
      expect(TipoCampo.criar('C').obterValor().ehNumerico()).toBe(false);
      expect(TipoCampo.criar('D').obterValor().ehNumerico()).toBe(false);
      expect(TipoCampo.criar('H').obterValor().ehNumerico()).toBe(false);
      expect(TipoCampo.criar('B').obterValor().ehNumerico()).toBe(false);
    });
  });

  describe('obterDescricao', () => {
    it('deve retornar descricao correta para cada tipo', () => {
      expect(TipoCampo.criar('S').obterValor().obterDescricao()).toBe('String/Texto');
      expect(TipoCampo.criar('I').obterValor().obterDescricao()).toBe('Inteiro');
      expect(TipoCampo.criar('F').obterValor().obterDescricao()).toBe('Float/Decimal');
      expect(TipoCampo.criar('D').obterValor().obterDescricao()).toBe('Data');
      expect(TipoCampo.criar('H').obterValor().obterDescricao()).toBe('Hora');
      expect(TipoCampo.criar('B').obterValor().obterDescricao()).toBe('Booleano');
      expect(TipoCampo.criar('C').obterValor().obterDescricao()).toBe('CLOB (texto longo)');
    });
  });

  describe('equals', () => {
    it('deve comparar tipos corretamente', () => {
      const tipo1 = TipoCampo.criar('S').obterValor();
      const tipo2 = TipoCampo.criar('S').obterValor();
      const tipo3 = TipoCampo.criar('I').obterValor();

      expect(tipo1.equals(tipo2)).toBe(true);
      expect(tipo1.equals(tipo3)).toBe(false);
    });

    it('deve retornar false quando comparando com null', () => {
      const tipo = TipoCampo.criar('S').obterValor();
      expect(tipo.equals(null as any)).toBe(false);
    });

    it('deve retornar false quando comparando com undefined', () => {
      const tipo = TipoCampo.criar('S').obterValor();
      expect(tipo.equals(undefined as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('deve retornar o valor do tipo como string', () => {
      expect(TipoCampo.criar('S').obterValor().toString()).toBe('S');
      expect(TipoCampo.criar('I').obterValor().toString()).toBe('I');
      expect(TipoCampo.criar('F').obterValor().toString()).toBe('F');
    });
  });

  describe('imutabilidade', () => {
    it('deve ser um objeto congelado (imutavel)', () => {
      const tipo = TipoCampo.criar('S').obterValor();
      expect(Object.isFrozen(tipo)).toBe(true);
    });
  });
});
