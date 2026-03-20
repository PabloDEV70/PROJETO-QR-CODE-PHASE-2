import { Resultado } from '../../shared/resultado';

export interface PropriedadesInstancia {
  nomeInstancia: string;
  nomeTabela: string;
  descricao?: string;
  ordem?: number;
  ativa?: string;
}

export class Instancia {
  private constructor(
    private readonly _nomeInstancia: string,
    private readonly _nomeTabela: string,
    private readonly _descricao: string,
    private readonly _ordem: number,
    private readonly _ativa: boolean,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesInstancia): Resultado<Instancia> {
    if (!props.nomeInstancia || props.nomeInstancia.trim().length === 0) {
      return Resultado.falhar('Nome da instância não pode ser vazio');
    }
    if (!props.nomeTabela || props.nomeTabela.trim().length === 0) {
      return Resultado.falhar('Nome da tabela não pode ser vazio');
    }
    return Resultado.ok(
      new Instancia(
        props.nomeInstancia.trim(),
        props.nomeTabela.toUpperCase(),
        props.descricao?.trim() || '',
        props.ordem || 0,
        props.ativa?.toUpperCase() !== 'N',
      ),
    );
  }

  get nomeInstancia(): string {
    return this._nomeInstancia;
  }
  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get descricao(): string {
    return this._descricao;
  }
  get ordem(): number {
    return this._ordem;
  }
  get ativa(): boolean {
    return this._ativa;
  }
  estaAtiva(): boolean {
    return this._ativa;
  }
  equals(outra: Instancia): boolean {
    return outra ? this._nomeInstancia === outra._nomeInstancia : false;
  }
}
