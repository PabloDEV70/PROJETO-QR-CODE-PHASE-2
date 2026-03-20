import { Resultado } from '../../shared/resultado';

export type TipoLigacaoValor = 'M' | 'D';

const TIPOS_VALIDOS: TipoLigacaoValor[] = ['M', 'D'];
const DESCRICOES: Record<TipoLigacaoValor, string> = {
  M: 'Master (tabela pai)',
  D: 'Detail (tabela filha)',
};

export class TipoLigacao {
  private constructor(private readonly _valor: TipoLigacaoValor) {
    Object.freeze(this);
  }

  static criar(tipo: string): Resultado<TipoLigacao> {
    if (!tipo) return Resultado.falhar('Tipo de ligação não pode ser vazio');
    const tipoUpper = tipo.toUpperCase() as TipoLigacaoValor;
    if (!TIPOS_VALIDOS.includes(tipoUpper)) {
      return Resultado.falhar(`Tipo de ligação inválido: ${tipo}. Válidos: ${TIPOS_VALIDOS.join(', ')}`);
    }
    return Resultado.ok(new TipoLigacao(tipoUpper));
  }

  get valor(): TipoLigacaoValor {
    return this._valor;
  }
  obterDescricao(): string {
    return DESCRICOES[this._valor];
  }
  ehMaster(): boolean {
    return this._valor === 'M';
  }
  ehDetail(): boolean {
    return this._valor === 'D';
  }
  equals(outro: TipoLigacao): boolean {
    return outro ? this._valor === outro._valor : false;
  }
  toString(): string {
    return this._valor;
  }
}
