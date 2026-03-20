import { Resultado } from '../../shared/resultado';

export type TipoApresentacaoValor = 'P' | 'O' | 'C' | 'N' | 'H' | 'D' | 'E';

const TIPOS_VALIDOS: TipoApresentacaoValor[] = ['P', 'O', 'C', 'N', 'H', 'D', 'E'];

const DESCRICOES: Record<TipoApresentacaoValor, string> = {
  P: 'Pesquisa',
  O: 'Opcional',
  C: 'Campo visível',
  N: 'Não exibir',
  H: 'Oculto',
  D: 'Desabilitado',
  E: 'Editável',
};

export class TipoApresentacao {
  private constructor(private readonly _valor: TipoApresentacaoValor) {
    Object.freeze(this);
  }

  static criar(tipo: string): Resultado<TipoApresentacao> {
    if (!tipo) return Resultado.falhar('Tipo de apresentação não pode ser vazio');
    const tipoUpper = tipo.toUpperCase() as TipoApresentacaoValor;
    if (!TIPOS_VALIDOS.includes(tipoUpper)) {
      return Resultado.falhar(`Tipo de apresentação inválido: ${tipo}. Válidos: ${TIPOS_VALIDOS.join(', ')}`);
    }
    return Resultado.ok(new TipoApresentacao(tipoUpper));
  }

  get valor(): TipoApresentacaoValor {
    return this._valor;
  }
  obterDescricao(): string {
    return DESCRICOES[this._valor];
  }
  ehVisivel(): boolean {
    return this._valor !== 'N' && this._valor !== 'H';
  }
  ehEditavel(): boolean {
    return this._valor === 'E' || this._valor === 'C';
  }
  ehPesquisa(): boolean {
    return this._valor === 'P';
  }
  equals(outro: TipoApresentacao): boolean {
    return outro ? this._valor === outro._valor : false;
  }
  toString(): string {
    return this._valor;
  }
}
