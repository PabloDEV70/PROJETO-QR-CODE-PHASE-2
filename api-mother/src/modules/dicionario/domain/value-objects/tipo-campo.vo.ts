import { Resultado } from '../../shared/resultado';

export type TipoCampoValor = 'S' | 'I' | 'F' | 'D' | 'H' | 'B' | 'C';

const TIPOS_VALIDOS: TipoCampoValor[] = ['S', 'I', 'F', 'D', 'H', 'B', 'C'];

const DESCRICOES_TIPO: Record<TipoCampoValor, string> = {
  S: 'String/Texto',
  I: 'Inteiro',
  F: 'Float/Decimal',
  D: 'Data',
  H: 'Hora',
  B: 'Booleano',
  C: 'CLOB (texto longo)',
};

export class TipoCampo {
  private constructor(private readonly _valor: TipoCampoValor) {
    Object.freeze(this);
  }

  static criar(tipo: string): Resultado<TipoCampo> {
    if (!tipo) {
      return Resultado.falhar('Tipo de campo não pode ser vazio');
    }
    const tipoUpper = tipo.toUpperCase() as TipoCampoValor;
    if (!TIPOS_VALIDOS.includes(tipoUpper)) {
      return Resultado.falhar(`Tipo de campo inválido: ${tipo}. Válidos: ${TIPOS_VALIDOS.join(', ')}`);
    }
    return Resultado.ok(new TipoCampo(tipoUpper));
  }

  get valor(): TipoCampoValor {
    return this._valor;
  }
  obterDescricao(): string {
    return DESCRICOES_TIPO[this._valor];
  }
  ehTexto(): boolean {
    return this._valor === 'S' || this._valor === 'C';
  }
  ehNumerico(): boolean {
    return this._valor === 'I' || this._valor === 'F';
  }
  ehData(): boolean {
    return this._valor === 'D';
  }
  ehHora(): boolean {
    return this._valor === 'H';
  }
  ehBooleano(): boolean {
    return this._valor === 'B';
  }
  equals(outro: TipoCampo): boolean {
    return outro ? this._valor === outro._valor : false;
  }
  toString(): string {
    return this._valor;
  }
}
