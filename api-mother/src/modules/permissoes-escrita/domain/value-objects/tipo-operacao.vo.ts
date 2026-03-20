import { Resultado } from '../../shared/resultado';

/**
 * Tipos de operação SQL suportados.
 * I = Insert, U = Update, D = Delete, S = Select
 */
export type TipoOperacaoSigla = 'I' | 'U' | 'D' | 'S';

const TIPOS_VALIDOS: TipoOperacaoSigla[] = ['I', 'U', 'D', 'S'];

const DESCRICAO_TIPOS: Record<TipoOperacaoSigla, string> = {
  I: 'Insert',
  U: 'Update',
  D: 'Delete',
  S: 'Select',
};

/**
 * Value Object que representa o tipo de operação SQL.
 * Encapsula validação e comportamentos relacionados ao tipo de operação.
 */
export class TipoOperacao {
  private constructor(private readonly _valor: TipoOperacaoSigla) {
    Object.freeze(this);
  }

  /**
   * Cria uma instância de TipoOperacao a partir de uma string.
   * @param valor - Sigla da operação (I, U, D ou S)
   */
  static criar(valor: string): Resultado<TipoOperacao> {
    if (!valor || valor.trim().length === 0) {
      return Resultado.falhar('Tipo de operação não pode ser vazio');
    }

    const valorUpper = valor.trim().toUpperCase() as TipoOperacaoSigla;

    if (!TIPOS_VALIDOS.includes(valorUpper)) {
      return Resultado.falhar(`Tipo de operação inválido: ${valor}. Valores permitidos: ${TIPOS_VALIDOS.join(', ')}`);
    }

    return Resultado.ok(new TipoOperacao(valorUpper));
  }

  /**
   * Cria TipoOperacao para Insert.
   */
  static insert(): TipoOperacao {
    return new TipoOperacao('I');
  }

  /**
   * Cria TipoOperacao para Update.
   */
  static update(): TipoOperacao {
    return new TipoOperacao('U');
  }

  /**
   * Cria TipoOperacao para Delete.
   */
  static delete(): TipoOperacao {
    return new TipoOperacao('D');
  }

  /**
   * Cria TipoOperacao para Select.
   */
  static select(): TipoOperacao {
    return new TipoOperacao('S');
  }

  get valor(): TipoOperacaoSigla {
    return this._valor;
  }

  get descricao(): string {
    return DESCRICAO_TIPOS[this._valor];
  }

  ehInsert(): boolean {
    return this._valor === 'I';
  }

  ehUpdate(): boolean {
    return this._valor === 'U';
  }

  ehDelete(): boolean {
    return this._valor === 'D';
  }

  ehSelect(): boolean {
    return this._valor === 'S';
  }

  /**
   * Verifica se é uma operação de escrita (I, U ou D).
   */
  ehEscrita(): boolean {
    return this._valor !== 'S';
  }

  /**
   * Verifica se é uma operação de leitura (S).
   */
  ehLeitura(): boolean {
    return this._valor === 'S';
  }

  equals(outro: TipoOperacao): boolean {
    if (!outro) return false;
    return this._valor === outro._valor;
  }

  toString(): string {
    return this._valor;
  }
}
