/**
 * Entidade de Domínio: Campo
 *
 * Representa um campo/coluna do dicionário de dados Sankhya (TDDCAM).
 * Imutável - todos os valores são readonly.
 *
 * @module dictionary-v2
 */

export type TipoCampo = 'C' | 'N' | 'D' | 'T' | 'M' | 'B' | string;

export interface OpcaoCampo {
  readonly valor: string;
  readonly opcao: string;
  readonly padrao: string | null;
  readonly ordem: number | null;
}

export class Campo {
  private constructor(
    public readonly numeroCampo: number,
    public readonly nomeTabela: string,
    public readonly nomeCampo: string,
    public readonly descricao: string,
    public readonly tipoCampo: TipoCampo,
    public readonly tipoApresentacao: string | null,
    public readonly tamanho: number | null,
    public readonly mascara: string | null,
    public readonly expressao: string | null,
    public readonly permitePesquisa: string | null,
    public readonly calculado: string | null,
    public readonly permitePadrao: string | null,
    public readonly apresentacao: string | null,
    public readonly ordem: number | null,
    public readonly visivelGridPesquisa: string | null,
    public readonly sistema: string | null,
    public readonly adicional: string | null,
    public readonly controle: string | null,
    public readonly opcoes: OpcaoCampo[] = [],
  ) {
    if (!nomeCampo || nomeCampo.trim() === '') {
      throw new Error('Nome do campo é obrigatório');
    }
  }

  /**
   * Factory method para criar Campo a partir de dados do banco
   */
  static criar(dados: {
    NUCAMPO: number;
    NOMETAB: string;
    NOMECAMPO: string;
    DESCRCAMPO?: string;
    TIPCAMPO?: string;
    TIPOAPRESENTACAO?: string | null;
    TAMANHO?: number | null;
    MASCARA?: string | null;
    EXPRESSAO?: string | null;
    PERMITEPESQUISA?: string | null;
    CALCULADO?: string | null;
    PERMITEPADRAO?: string | null;
    APRESENTACAO?: string | null;
    ORDEM?: number | null;
    VISIVELGRIDPESQUISA?: string | null;
    SISTEMA?: string | null;
    ADICIONAL?: string | null;
    CONTROLE?: string | null;
  }): Campo {
    return new Campo(
      dados.NUCAMPO,
      dados.NOMETAB,
      dados.NOMECAMPO,
      dados.DESCRCAMPO || '',
      (dados.TIPCAMPO as TipoCampo) || 'C',
      dados.TIPOAPRESENTACAO || null,
      dados.TAMANHO || null,
      dados.MASCARA || null,
      dados.EXPRESSAO || null,
      dados.PERMITEPESQUISA || null,
      dados.CALCULADO || null,
      dados.PERMITEPADRAO || null,
      dados.APRESENTACAO || null,
      dados.ORDEM || null,
      dados.VISIVELGRIDPESQUISA || null,
      dados.SISTEMA || null,
      dados.ADICIONAL || null,
      dados.CONTROLE || null,
    );
  }

  /**
   * Adiciona opções ao campo (retorna novo Campo com opções)
   */
  comOpcoes(opcoes: OpcaoCampo[]): Campo {
    return new Campo(
      this.numeroCampo,
      this.nomeTabela,
      this.nomeCampo,
      this.descricao,
      this.tipoCampo,
      this.tipoApresentacao,
      this.tamanho,
      this.mascara,
      this.expressao,
      this.permitePesquisa,
      this.calculado,
      this.permitePadrao,
      this.apresentacao,
      this.ordem,
      this.visivelGridPesquisa,
      this.sistema,
      this.adicional,
      this.controle,
      opcoes,
    );
  }

  /**
   * Verifica se o campo é calculado
   */
  ehCalculado(): boolean {
    return this.calculado === 'S';
  }

  /**
   * Verifica se o campo permite pesquisa
   */
  permitePesquisar(): boolean {
    return this.permitePesquisa === 'S';
  }

  /**
   * Verifica se o campo tem opções pré-definidas
   */
  temOpcoes(): boolean {
    return this.opcoes.length > 0;
  }

  /**
   * Retorna o tipo de dado legível
   */
  obterTipoLegivel(): string {
    const tipos: Record<string, string> = {
      C: 'Caractere',
      N: 'Numérico',
      D: 'Data',
      T: 'Texto',
      M: 'Memo',
      B: 'Binário',
    };
    return tipos[this.tipoCampo] || this.tipoCampo;
  }
}
