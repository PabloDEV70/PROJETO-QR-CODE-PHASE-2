/**
 * Entity: ColunaTabela
 *
 * Representa uma coluna de uma tabela do banco de dados.
 */
export interface DadosColunaTabela {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  ORDINAL_POSITION: number;
  CHARACTER_MAXIMUM_LENGTH?: number;
  NUMERIC_PRECISION?: number;
  NUMERIC_SCALE?: number;
}

export class ColunaTabela {
  private constructor(
    public readonly nome: string,
    public readonly tipo: string,
    public readonly nulo: boolean,
    public readonly posicao: number,
    public readonly tamanhoMaximo: number | null,
    public readonly precisao: number | null,
    public readonly escala: number | null,
  ) {}

  static criar(dados: DadosColunaTabela): ColunaTabela {
    return new ColunaTabela(
      dados.COLUMN_NAME,
      dados.DATA_TYPE,
      dados.IS_NULLABLE === 'YES',
      dados.ORDINAL_POSITION,
      dados.CHARACTER_MAXIMUM_LENGTH || null,
      dados.NUMERIC_PRECISION || null,
      dados.NUMERIC_SCALE || null,
    );
  }

  /**
   * Verifica se é coluna obrigatória
   */
  ehObrigatoria(): boolean {
    return !this.nulo;
  }

  /**
   * Verifica se é tipo numérico
   */
  ehNumerico(): boolean {
    const tiposNumericos = ['int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money'];
    return tiposNumericos.includes(this.tipo.toLowerCase());
  }

  /**
   * Verifica se é tipo texto
   */
  ehTexto(): boolean {
    const tiposTexto = ['char', 'varchar', 'nchar', 'nvarchar', 'text', 'ntext'];
    return tiposTexto.includes(this.tipo.toLowerCase());
  }

  /**
   * Verifica se é tipo data/hora
   */
  ehDataHora(): boolean {
    const tiposData = ['date', 'datetime', 'datetime2', 'time', 'smalldatetime', 'datetimeoffset'];
    return tiposData.includes(this.tipo.toLowerCase());
  }

  /**
   * Retorna tipo formatado com tamanho
   */
  obterTipoFormatado(): string {
    if (this.tamanhoMaximo !== null && this.tamanhoMaximo > 0) {
      return `${this.tipo}(${this.tamanhoMaximo})`;
    }
    if (this.precisao !== null && this.escala !== null) {
      return `${this.tipo}(${this.precisao},${this.escala})`;
    }
    return this.tipo;
  }
}
