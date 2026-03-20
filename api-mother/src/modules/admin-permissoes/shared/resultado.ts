/**
 * Monad para tratamento de erros de forma funcional.
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
}
