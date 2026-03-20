/**
 * Entity: OperacaoMutacao
 *
 * Representa uma operação de mutação (INSERT, UPDATE, DELETE).
 */

export type TipoOperacao = 'INSERT' | 'UPDATE' | 'DELETE';

export interface DadosOperacaoMutacao {
  tipo: TipoOperacao;
  nomeTabela: string;
  dados?: Record<string, unknown>;
  condicao?: Record<string, unknown>;
  dadosNovos?: Record<string, unknown>;
  limiteRegistros?: number;
  dryRun?: boolean;
  softDelete?: boolean;
}

export class OperacaoMutacao {
  private constructor(
    public readonly tipo: TipoOperacao,
    public readonly nomeTabela: string,
    public readonly dados: Record<string, unknown> | null,
    public readonly condicao: Record<string, unknown> | null,
    public readonly dadosNovos: Record<string, unknown> | null,
    public readonly limiteRegistros: number,
    public readonly dryRun: boolean,
    public readonly softDelete: boolean,
  ) {}

  static criar(entrada: DadosOperacaoMutacao): OperacaoMutacao {
    return new OperacaoMutacao(
      entrada.tipo,
      entrada.nomeTabela.toUpperCase(),
      entrada.dados || null,
      entrada.condicao || null,
      entrada.dadosNovos || null,
      entrada.limiteRegistros || (entrada.tipo === 'DELETE' ? 1 : 10),
      entrada.dryRun || false,
      entrada.softDelete !== false, // default true
    );
  }

  /**
   * Verifica se é operação de inserção
   */
  ehInsercao(): boolean {
    return this.tipo === 'INSERT';
  }

  /**
   * Verifica se é operação de atualização
   */
  ehAtualizacao(): boolean {
    return this.tipo === 'UPDATE';
  }

  /**
   * Verifica se é operação de exclusão
   */
  ehExclusao(): boolean {
    return this.tipo === 'DELETE';
  }

  /**
   * Verifica se é apenas simulação
   */
  ehSimulacao(): boolean {
    return this.dryRun;
  }

  /**
   * Retorna descrição da operação
   */
  obterDescricao(): string {
    const modo = this.dryRun ? '[DRY-RUN] ' : '';
    return `${modo}${this.tipo} em ${this.nomeTabela}`;
  }
}
