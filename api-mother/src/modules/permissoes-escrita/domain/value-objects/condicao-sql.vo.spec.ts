import { CondicaoSQL } from './condicao-sql.vo';

describe('CondicaoSQL', () => {
  describe('criar', () => {
    it('deve criar condição SQL válida', () => {
      const resultado = CondicaoSQL.criar('CODEMP = :codEmp');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().valor).toBe('CODEMP = :codEmp');
    });

    it('deve criar condição vazia quando valor é null', () => {
      const resultado = CondicaoSQL.criar(null);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().estaVazia()).toBe(true);
    });

    it('deve criar condição vazia quando valor é string vazia', () => {
      const resultado = CondicaoSQL.criar('');

      expect(resultado.sucesso).toBe(true);
      expect(resultado.obterValor().estaVazia()).toBe(true);
    });

    it('deve falhar quando contém DROP', () => {
      const resultado = CondicaoSQL.criar('DROP TABLE usuarios');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('DROP');
    });

    it('deve falhar quando contém TRUNCATE', () => {
      const resultado = CondicaoSQL.criar('TRUNCATE TABLE usuarios');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('TRUNCATE');
    });

    it('deve falhar quando contém EXEC', () => {
      const resultado = CondicaoSQL.criar('EXEC sp_malicioso');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('EXEC');
    });

    it('deve falhar quando contém ponto-e-vírgula', () => {
      const resultado = CondicaoSQL.criar('1=1; DELETE FROM usuarios');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('ponto-e-vírgula');
    });

    it('deve falhar quando parênteses desbalanceados', () => {
      const resultado = CondicaoSQL.criar('((CODEMP = 1)');

      expect(resultado.falhou).toBe(true);
      expect(resultado.erro).toContain('desbalanceados');
    });

    it('deve aceitar condição com parênteses balanceados', () => {
      const resultado = CondicaoSQL.criar('(CODEMP = :codEmp) AND (ATIVO = :ativo)');

      expect(resultado.sucesso).toBe(true);
    });
  });

  describe('vazia', () => {
    it('deve criar condição vazia via factory method', () => {
      const condicao = CondicaoSQL.vazia();

      expect(condicao.estaVazia()).toBe(true);
      expect(condicao.valor).toBeNull();
    });
  });

  describe('possuiParametros', () => {
    it('deve identificar condição com parâmetros', () => {
      const resultado = CondicaoSQL.criar('CODEMP = :codEmp AND ATIVO = :ativo');
      const condicao = resultado.obterValor();

      expect(condicao.possuiParametros()).toBe(true);
    });

    it('deve identificar condição sem parâmetros', () => {
      const resultado = CondicaoSQL.criar("ATIVO = 'S'");
      const condicao = resultado.obterValor();

      expect(condicao.possuiParametros()).toBe(false);
    });

    it('deve retornar false para condição vazia', () => {
      const condicao = CondicaoSQL.vazia();

      expect(condicao.possuiParametros()).toBe(false);
    });
  });

  describe('extrairParametros', () => {
    it('deve extrair nomes dos parâmetros', () => {
      const resultado = CondicaoSQL.criar('CODEMP = :codEmp AND CODUSU = :codUsuario');
      const condicao = resultado.obterValor();

      const parametros = condicao.extrairParametros();

      expect(parametros).toContain('codEmp');
      expect(parametros).toContain('codUsuario');
      expect(parametros).toHaveLength(2);
    });

    it('deve retornar array vazio para condição sem parâmetros', () => {
      const resultado = CondicaoSQL.criar("ATIVO = 'S'");
      const condicao = resultado.obterValor();

      expect(condicao.extrairParametros()).toHaveLength(0);
    });
  });

  describe('combinarCom', () => {
    it('deve combinar duas condições com AND', () => {
      const condicao1 = CondicaoSQL.criar('CODEMP = :codEmp').obterValor();
      const condicao2 = CondicaoSQL.criar("ATIVO = 'S'").obterValor();

      const combinada = condicao1.combinarCom(condicao2);

      expect(combinada.valor).toContain('AND');
      expect(combinada.valor).toContain('CODEMP');
      expect(combinada.valor).toContain('ATIVO');
    });

    it('deve retornar outra condição quando primeira é vazia', () => {
      const vazia = CondicaoSQL.vazia();
      const condicao = CondicaoSQL.criar('CODEMP = 1').obterValor();

      const combinada = vazia.combinarCom(condicao);

      expect(combinada.valor).toBe('CODEMP = 1');
    });

    it('deve retornar primeira condição quando segunda é vazia', () => {
      const condicao = CondicaoSQL.criar('CODEMP = 1').obterValor();
      const vazia = CondicaoSQL.vazia();

      const combinada = condicao.combinarCom(vazia);

      expect(combinada.valor).toBe('CODEMP = 1');
    });
  });

  describe('paraWhere', () => {
    it('deve retornar condição formatada', () => {
      const resultado = CondicaoSQL.criar('CODEMP = :codEmp');
      const condicao = resultado.obterValor();

      expect(condicao.paraWhere()).toBe('CODEMP = :codEmp');
    });

    it('deve retornar 1=1 para condição vazia', () => {
      const condicao = CondicaoSQL.vazia();

      expect(condicao.paraWhere()).toBe('1=1');
    });
  });
});
