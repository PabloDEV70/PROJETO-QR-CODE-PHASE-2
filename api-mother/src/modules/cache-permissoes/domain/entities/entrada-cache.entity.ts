/**
 * Entidade que representa uma entrada no cache.
 *
 * Encapsula o valor armazenado junto com metadados de cache
 * como expiracao, contagem de acessos e timestamps.
 *
 * @module M6 - Cache de Permissoes
 */

export interface DadosEntradaCache<T> {
  chave: string;
  valor: T;
  ttlSegundos: number;
  criadoEm?: Date;
  metadata?: Record<string, unknown>;
}

export class EntradaCache<T> {
  private readonly _chave: string;
  private readonly _valor: T;
  private readonly _expiraEm: Date;
  private readonly _criadoEm: Date;
  private _acessos: number;
  private _ultimoAcesso: Date;
  private readonly _metadata: Record<string, unknown>;

  private constructor(dados: DadosEntradaCache<T>) {
    this._chave = dados.chave;
    this._valor = dados.valor;
    this._criadoEm = dados.criadoEm || new Date();
    this._expiraEm = new Date(this._criadoEm.getTime() + dados.ttlSegundos * 1000);
    this._acessos = 0;
    this._ultimoAcesso = this._criadoEm;
    this._metadata = dados.metadata || {};
  }

  static criar<T>(dados: DadosEntradaCache<T>): EntradaCache<T> {
    return new EntradaCache(dados);
  }

  get chave(): string {
    return this._chave;
  }

  get valor(): T {
    return this._valor;
  }

  get expiraEm(): Date {
    return this._expiraEm;
  }

  get criadoEm(): Date {
    return this._criadoEm;
  }

  get acessos(): number {
    return this._acessos;
  }

  get ultimoAcesso(): Date {
    return this._ultimoAcesso;
  }

  get metadata(): Record<string, unknown> {
    return { ...this._metadata };
  }

  estaExpirado(): boolean {
    return new Date() > this._expiraEm;
  }

  ttlRestante(): number {
    const restante = this._expiraEm.getTime() - Date.now();
    return Math.max(0, Math.floor(restante / 1000));
  }

  registrarAcesso(): void {
    this._acessos++;
    this._ultimoAcesso = new Date();
  }

  toJSON(): object {
    return {
      chave: this._chave,
      valor: this._valor,
      expiraEm: this._expiraEm.toISOString(),
      criadoEm: this._criadoEm.toISOString(),
      acessos: this._acessos,
      ultimoAcesso: this._ultimoAcesso.toISOString(),
      ttlRestante: this.ttlRestante(),
      expirado: this.estaExpirado(),
      metadata: this._metadata,
    };
  }
}
