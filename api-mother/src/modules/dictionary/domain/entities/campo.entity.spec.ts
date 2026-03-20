import { Campo, OpcaoCampo } from './campo.entity';

describe('Campo Entity', () => {
  const dadosBasicos = {
    NUCAMPO: 12345,
    NOMETAB: 'TGFPAR',
    NOMECAMPO: 'CODPARC',
    DESCRCAMPO: 'Código do Parceiro',
    TIPCAMPO: 'N',
    TAMANHO: 10,
    PERMITEPESQUISA: 'S',
    CALCULADO: 'N',
    ORDEM: 1,
  };

  describe('criar', () => {
    it('deve criar Campo com dados válidos', () => {
      const campo = Campo.criar(dadosBasicos);

      expect(campo.numeroCampo).toBe(12345);
      expect(campo.nomeTabela).toBe('TGFPAR');
      expect(campo.nomeCampo).toBe('CODPARC');
      expect(campo.descricao).toBe('Código do Parceiro');
      expect(campo.tipoCampo).toBe('N');
      expect(campo.tamanho).toBe(10);
    });

    it('deve lançar erro se nome do campo for vazio', () => {
      const dados = {
        ...dadosBasicos,
        NOMECAMPO: '',
      };

      expect(() => Campo.criar(dados)).toThrow('Nome do campo é obrigatório');
    });
  });

  describe('comOpcoes', () => {
    it('deve retornar novo Campo com opções', () => {
      const campo = Campo.criar(dadosBasicos);
      const opcoes: OpcaoCampo[] = [
        { valor: 'S', opcao: 'Sim', padrao: 'S', ordem: 1 },
        { valor: 'N', opcao: 'Não', padrao: null, ordem: 2 },
      ];

      const campoComOpcoes = campo.comOpcoes(opcoes);

      expect(campoComOpcoes.opcoes).toHaveLength(2);
      expect(campoComOpcoes.opcoes[0].valor).toBe('S');
      expect(campo.opcoes).toHaveLength(0); // Original não modificado
    });
  });

  describe('ehCalculado', () => {
    it('deve retornar true quando CALCULADO é S', () => {
      const campo = Campo.criar({ ...dadosBasicos, CALCULADO: 'S' });
      expect(campo.ehCalculado()).toBe(true);
    });

    it('deve retornar false quando CALCULADO é N', () => {
      const campo = Campo.criar({ ...dadosBasicos, CALCULADO: 'N' });
      expect(campo.ehCalculado()).toBe(false);
    });
  });

  describe('permitePesquisar', () => {
    it('deve retornar true quando PERMITEPESQUISA é S', () => {
      const campo = Campo.criar({ ...dadosBasicos, PERMITEPESQUISA: 'S' });
      expect(campo.permitePesquisar()).toBe(true);
    });

    it('deve retornar false quando PERMITEPESQUISA é N', () => {
      const campo = Campo.criar({ ...dadosBasicos, PERMITEPESQUISA: 'N' });
      expect(campo.permitePesquisar()).toBe(false);
    });
  });

  describe('obterTipoLegivel', () => {
    it('deve retornar tipo legível para C', () => {
      const campo = Campo.criar({ ...dadosBasicos, TIPCAMPO: 'C' });
      expect(campo.obterTipoLegivel()).toBe('Caractere');
    });

    it('deve retornar tipo legível para N', () => {
      const campo = Campo.criar({ ...dadosBasicos, TIPCAMPO: 'N' });
      expect(campo.obterTipoLegivel()).toBe('Numérico');
    });

    it('deve retornar tipo legível para D', () => {
      const campo = Campo.criar({ ...dadosBasicos, TIPCAMPO: 'D' });
      expect(campo.obterTipoLegivel()).toBe('Data');
    });

    it('deve retornar tipo original para tipo desconhecido', () => {
      const campo = Campo.criar({ ...dadosBasicos, TIPCAMPO: 'X' });
      expect(campo.obterTipoLegivel()).toBe('X');
    });
  });

  describe('temOpcoes', () => {
    it('deve retornar false quando não tem opções', () => {
      const campo = Campo.criar(dadosBasicos);
      expect(campo.temOpcoes()).toBe(false);
    });

    it('deve retornar true quando tem opções', () => {
      const campo = Campo.criar(dadosBasicos).comOpcoes([{ valor: 'S', opcao: 'Sim', padrao: null, ordem: 1 }]);
      expect(campo.temOpcoes()).toBe(true);
    });
  });
});
