/**
 * Classe genérica para representar o resultado de uma operação.
 * Padrão Result/Either para tratamento de erros sem exceptions.
 */
export class Resultado<T> {
  private constructor(
    public readonly sucesso: boolean,
    public readonly erro?: string,
    private readonly _valor?: T,
  ) {
    Object.freeze(this);
  }

  static ok<U>(valor?: U): Resultado<U> {
    return new Resultado<U>(true, undefined, valor);
  }

  static falhar<U>(erro: string): Resultado<U> {
    return new Resultado<U>(false, erro);
  }

  static combinar(resultados: Resultado<unknown>[]): Resultado<void> {
    for (const resultado of resultados) {
      if (resultado.falhou) {
        return Resultado.falhar(resultado.erro!);
      }
    }
    return Resultado.ok();
  }

  get falhou(): boolean {
    return !this.sucesso;
  }

  obterValor(): T {
    if (this.falhou) {
      throw new Error(`Erro: ${this.erro}`);
    }
    return this._valor as T;
  }

  obterValorOu(valorPadrao: T): T {
    return this.falhou ? valorPadrao : (this._valor as T);
  }

  map<U>(fn: (valor: T) => U): Resultado<U> {
    if (this.falhou) {
      return Resultado.falhar<U>(this.erro!);
    }
    try {
      return Resultado.ok(fn(this._valor as T));
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : String(error);
      return Resultado.falhar<U>(mensagem);
    }
  }

  flatMap<U>(fn: (valor: T) => Resultado<U>): Resultado<U> {
    if (this.falhou) {
      return Resultado.falhar<U>(this.erro!);
    }
    try {
      return fn(this._valor as T);
    } catch (error: unknown) {
      const mensagem = error instanceof Error ? error.message : String(error);
      return Resultado.falhar<U>(mensagem);
    }
  }
}
