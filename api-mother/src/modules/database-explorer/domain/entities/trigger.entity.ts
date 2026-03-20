/**
 * Entity: Trigger
 *
 * Representa um trigger do banco de dados.
 */
export interface DadosTrigger {
  schema_name: string;
  trigger_name: string;
  table_name: string;
  definition?: string;
  is_disabled?: boolean;
  is_instead_of_trigger?: boolean;
  type_desc?: string;
  create_date?: Date;
  modify_date?: Date;
}

export interface DadosTriggerDetalhe extends DadosTrigger {
  trigger_events?: string[];
}

export class Trigger {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly tabela: string,
    public readonly definicao: string | null,
    public readonly desabilitado: boolean,
    public readonly tipoDescricao: string,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
  ) {}

  static criar(dados: DadosTrigger): Trigger {
    return new Trigger(
      dados.schema_name,
      dados.trigger_name,
      dados.table_name,
      dados.definition || null,
      dados.is_disabled ?? false,
      dados.type_desc || '',
      dados.create_date || null,
      dados.modify_date || null,
    );
  }

  /**
   * Retorna o nome completo do trigger (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se o trigger está ativo
   */
  estaAtivo(): boolean {
    return !this.desabilitado;
  }

  /**
   * Verifica se o trigger tem definição
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

export class TriggerDetalhe {
  private constructor(
    public readonly schema: string,
    public readonly nome: string,
    public readonly tabela: string,
    public readonly definicao: string | null,
    public readonly desabilitado: boolean,
    public readonly tipoDescricao: string,
    public readonly dataCriacao: Date | null,
    public readonly dataModificacao: Date | null,
    public readonly eventos: string[],
  ) {}

  static criar(dados: DadosTriggerDetalhe): TriggerDetalhe {
    return new TriggerDetalhe(
      dados.schema_name,
      dados.trigger_name,
      dados.table_name,
      dados.definition || null,
      dados.is_disabled ?? false,
      dados.type_desc || '',
      dados.create_date || null,
      dados.modify_date || null,
      dados.trigger_events || [],
    );
  }

  /**
   * Retorna o nome completo do trigger (schema.nome)
   */
  obterNomeCompleto(): string {
    return `${this.schema}.${this.nome}`;
  }

  /**
   * Verifica se o trigger está ativo
   */
  estaAtivo(): boolean {
    return !this.desabilitado;
  }

  /**
   * Verifica se o trigger tem definição
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
   * Verifica se dispara em INSERT
   */
  disparaEmInsert(): boolean {
    return this.eventos.includes('INSERT');
  }

  /**
   * Verifica se dispara em UPDATE
   */
  disparaEmUpdate(): boolean {
    return this.eventos.includes('UPDATE');
  }

  /**
   * Verifica se dispara em DELETE
   */
  disparaEmDelete(): boolean {
    return this.eventos.includes('DELETE');
  }

  /**
   * Retorna eventos formatados
   */
  obterEventosFormatados(): string {
    return this.eventos.join(', ');
  }
}
