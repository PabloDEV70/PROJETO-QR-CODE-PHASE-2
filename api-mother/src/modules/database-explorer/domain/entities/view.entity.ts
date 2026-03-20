/**
 * Entity: View
 *
 * Representa uma view do banco de dados.
 */
export interface DadosView {
  schema_name: string;
  view_name: string;
  definition?: string;
  created_date?: Date;
  modified_date?: Date;
  is_updatable?: boolean;
}

export interface DadosViewDetalhe extends DadosView {
  columns?: ColunaView[];
}

export interface ColunaView {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  ordinal_position: number;
  max_length?: number;
  precision?: number;
  scale?: number;
}

export class View {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly definicao: string | null,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
    public readonly atualizavel: boolean,
  ) {}

  static criar(dados: DadosView): View {
    return new View(
      dados.schema_name,
      dados.view_name,
      dados.definition || null,
      dados.created_date || null,
      dados.modified_date || null,
      dados.is_updatable ?? false,
    );
  }

  /**
   * Retorna o nome completo da view (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se a view tem definição
   */
  temDefinicao(): boolean {
    return this.definicao !== null && this.definicao.length > 0;
  }

  /**
   * Trunca a definição para exibição
   */
  obterDefinicaoTruncada(tamanhoMaximo = 500): string {
    if (!this.definicao) return '';
    if (this.definicao.length <= tamanhoMaximo) return this.definicao;
    return this.definicao.substring(0, tamanhoMaximo) + '...';
  }
}

export interface ColunaViewDetalhe {
  nome: string;
  tipo: string;
  nulo: boolean;
  posicao: number;
  tamanhoMaximo?: number;
  precisao?: number;
  escala?: number;
}

export class ViewDetalhe {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly definicao: string | null,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
    public readonly atualizavel: boolean,
    public readonly colunas: ColunaViewDetalhe[],
  ) {}

  static criar(dados: DadosViewDetalhe): ViewDetalhe {
    const colunas = (dados.columns || []).map((col) => ({
      nome: col.column_name,
      tipo: col.data_type,
      nulo: col.is_nullable,
      posicao: col.ordinal_position,
      tamanhoMaximo: col.max_length,
      precisao: col.precision,
      escala: col.scale,
    }));

    return new ViewDetalhe(
      dados.schema_name,
      dados.view_name,
      dados.definition || null,
      dados.created_date || null,
      dados.modified_date || null,
      dados.is_updatable ?? false,
      colunas,
    );
  }

  /**
   * Retorna o nome completo da view (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se a view tem definição
   */
  temDefinicao(): boolean {
    return this.definicao !== null && this.definicao.length > 0;
  }

  /**
   * Trunca a definição para exibição
   */
  obterDefinicaoTruncada(tamanhoMaximo = 500): string {
    if (!this.definicao) return '';
    if (this.definicao.length <= tamanhoMaximo) return this.definicao;
    return this.definicao.substring(0, tamanhoMaximo) + '...';
  }

  /**
   * Obtém quantidade de colunas
   */
  obterQuantidadeColunas(): number {
    return this.colunas.length;
  }
}
