/**
 * Entity: Procedure
 *
 * Representa uma stored procedure do banco de dados.
 */
export interface DadosProcedure {
  schema_name: string;
  procedure_name: string;
  definition?: string;
  type_desc?: string;
  created_date?: Date;
  modified_date?: Date;
}

export interface DadosProcedureDetalhe extends DadosProcedure {
  parameters?: ParametroProcedure[];
}

export interface ParametroProcedure {
  parameter_name: string;
  data_type: string;
  max_length?: number;
  precision?: number;
  scale?: number;
  is_output?: boolean;
}

export class Procedure {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly definicao: string | null,
    public readonly tipoDescricao: string,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
  ) {}

  static criar(dados: DadosProcedure): Procedure {
    return new Procedure(
      dados.schema_name,
      dados.procedure_name,
      dados.definition || null,
      dados.type_desc || '',
      dados.created_date || null,
      dados.modified_date || null,
    );
  }

  /**
   * Retorna o nome completo da procedure (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se a procedure tem definição
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

export interface ParametroProcedureDetalhe {
  nome: string;
  tipo: string;
  tamanhoMaximo?: number;
  precisao?: number;
  escala?: number;
  saida: boolean;
}

export class ProcedureDetalhe {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly definicao: string | null,
    public readonly tipoDescricao: string,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
    public readonly parametros: ParametroProcedureDetalhe[],
  ) {}

  static criar(dados: DadosProcedureDetalhe): ProcedureDetalhe {
    const parametros = (dados.parameters || []).map((param) => ({
      nome: param.parameter_name,
      tipo: param.data_type,
      tamanhoMaximo: param.max_length,
      precisao: param.precision,
      escala: param.scale,
      saida: param.is_output ?? false,
    }));

    return new ProcedureDetalhe(
      dados.schema_name,
      dados.procedure_name,
      dados.definition || null,
      dados.type_desc || '',
      dados.created_date || null,
      dados.modified_date || null,
      parametros,
    );
  }

  /**
   * Retorna o nome completo da procedure (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se a procedure tem definição
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
   * Obtém quantidade de parâmetros
   */
  obterQuantidadeParametros(): number {
    return this.parametros.length;
  }

  /**
   * Obtém parâmetros de entrada
   */
  obterParametrosEntrada(): ParametroProcedureDetalhe[] {
    return this.parametros.filter((p) => !p.saida);
  }

  /**
   * Obtém parâmetros de saída
   */
  obterParametrosSaida(): ParametroProcedureDetalhe[] {
    return this.parametros.filter((p) => p.saida);
  }
}
