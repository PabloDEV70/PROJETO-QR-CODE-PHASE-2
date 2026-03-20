import { Resultado } from '../../shared/resultado';

/**
 * Value Object que representa uma condição SQL para Row Level Security (RLS).
 * Encapsula validação e sanitização de condições SQL.
 */
export class CondicaoSQL {
  private constructor(private readonly _valor: string | null) {
    Object.freeze(this);
  }

  /**
   * Cria uma instância de CondicaoSQL.
   * @param valor - Condição SQL (ex: "CODEMP = :codEmp")
   */
  static criar(valor?: string | null): Resultado<CondicaoSQL> {
    if (!valor || valor.trim().length === 0) {
      return Resultado.ok(new CondicaoSQL(null));
    }

    const valorLimpo = valor.trim();

    // Validações de segurança básicas
    const palavrasProibidas = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'];
    const valorUpper = valorLimpo.toUpperCase();

    for (const palavra of palavrasProibidas) {
      if (valorUpper.includes(palavra)) {
        return Resultado.falhar(`Condição SQL contém palavra proibida: ${palavra}`);
      }
    }

    // Verificar se contém apenas caracteres válidos para condições WHERE
    if (valorLimpo.includes(';')) {
      return Resultado.falhar('Condição SQL não pode conter ponto-e-vírgula');
    }

    // Verificar balanceamento de parênteses
    let nivel = 0;
    for (const char of valorLimpo) {
      if (char === '(') nivel++;
      if (char === ')') nivel--;
      if (nivel < 0) {
        return Resultado.falhar('Condição SQL com parênteses desbalanceados');
      }
    }
    if (nivel !== 0) {
      return Resultado.falhar('Condição SQL com parênteses desbalanceados');
    }

    return Resultado.ok(new CondicaoSQL(valorLimpo));
  }

  /**
   * Cria uma condição vazia (sem restrição).
   */
  static vazia(): CondicaoSQL {
    return new CondicaoSQL(null);
  }

  get valor(): string | null {
    return this._valor;
  }

  /**
   * Verifica se a condição está vazia.
   */
  estaVazia(): boolean {
    return this._valor === null || this._valor.length === 0;
  }

  /**
   * Verifica se a condição possui parâmetros (usa placeholder :nome).
   */
  possuiParametros(): boolean {
    if (this.estaVazia()) return false;
    return /:[a-zA-Z_][a-zA-Z0-9_]*/.test(this._valor!);
  }

  /**
   * Extrai os nomes dos parâmetros da condição.
   */
  extrairParametros(): string[] {
    if (this.estaVazia()) return [];
    const matches = this._valor!.match(/:[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    return matches.map((m) => m.substring(1)); // Remove o : do início
  }

  /**
   * Combina esta condição com outra usando AND.
   */
  combinarCom(outra: CondicaoSQL): CondicaoSQL {
    if (this.estaVazia()) {
      return outra;
    }
    if (outra.estaVazia()) {
      return this;
    }
    return new CondicaoSQL(`(${this._valor}) AND (${outra.valor})`);
  }

  /**
   * Retorna a condição formatada para uso em WHERE.
   */
  paraWhere(): string {
    if (this.estaVazia()) return '1=1';
    return this._valor!;
  }

  equals(outro: CondicaoSQL): boolean {
    if (!outro) return false;
    return this._valor === outro._valor;
  }

  toString(): string {
    return this._valor || '';
  }
}
