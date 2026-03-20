import { Tabela } from './tabela.entity';

describe('Tabela Entity', () => {
  describe('criar', () => {
    it('deve criar Tabela com dados válidos', () => {
      const dados = {
        NOMETAB: 'TGFPAR',
        DESCRTAB: 'Parceiros',
        TIPONUMERACAO: 'S',
        NUCAMPONUMERACAO: 1,
        ADICIONAL: null,
      };

      const tabela = Tabela.criar(dados);

      expect(tabela.nomeTabela).toBe('TGFPAR');
      expect(tabela.descricao).toBe('Parceiros');
      expect(tabela.tipoNumeracao).toBe('S');
      expect(tabela.numeroCampoNumeracao).toBe(1);
    });

    it('deve lançar erro se nome da tabela for vazio', () => {
      const dados = {
        NOMETAB: '',
        DESCRTAB: 'Descrição',
      };

      expect(() => Tabela.criar(dados)).toThrow('Nome da tabela é obrigatório');
    });

    it('deve aceitar valores nulos opcionais', () => {
      const dados = {
        NOMETAB: 'TGFPAR',
        DESCRTAB: 'Parceiros',
      };

      const tabela = Tabela.criar(dados);

      expect(tabela.tipoNumeracao).toBeNull();
      expect(tabela.numeroCampoNumeracao).toBeNull();
      expect(tabela.adicional).toBeNull();
    });
  });

  describe('temNumeracaoAutomatica', () => {
    it('deve retornar true quando tem tipo e campo de numeração', () => {
      const tabela = Tabela.criar({
        NOMETAB: 'TGFPAR',
        DESCRTAB: 'Parceiros',
        TIPONUMERACAO: 'S',
        NUCAMPONUMERACAO: 1,
      });

      expect(tabela.temNumeracaoAutomatica()).toBe(true);
    });

    it('deve retornar false quando não tem numeração', () => {
      const tabela = Tabela.criar({
        NOMETAB: 'TGFPAR',
        DESCRTAB: 'Parceiros',
      });

      expect(tabela.temNumeracaoAutomatica()).toBe(false);
    });
  });
});
