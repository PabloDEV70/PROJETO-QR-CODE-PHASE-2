import { Resultado } from '../../shared/resultado';

export interface PropriedadesTabela {
  nomeTabela: string;
  descricao?: string;
  nomeInstancia?: string;
  modulo?: string;
  ativa?: string;
  tipoCrud?: string;
}

export class Tabela {
  private constructor(
    private readonly _nomeTabela: string,
    private readonly _descricao: string,
    private readonly _nomeInstancia: string,
    private readonly _modulo: string,
    private readonly _ativa: boolean,
    private readonly _tipoCrud: string,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesTabela): Resultado<Tabela> {
    if (!props.nomeTabela || props.nomeTabela.trim().length === 0) {
      return Resultado.falhar('Nome da tabela não pode ser vazio');
    }
    const nomeTabela = props.nomeTabela.trim().toUpperCase();
    return Resultado.ok(
      new Tabela(
        nomeTabela,
        props.descricao?.trim() || '',
        props.nomeInstancia?.trim() || nomeTabela,
        props.modulo?.trim() || '',
        props.ativa?.toUpperCase() !== 'N',
        props.tipoCrud?.trim() || 'CRUD',
      ),
    );
  }

  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get descricao(): string {
    return this._descricao;
  }
  get nomeInstancia(): string {
    return this._nomeInstancia;
  }
  get modulo(): string {
    return this._modulo;
  }
  get ativa(): boolean {
    return this._ativa;
  }
  get tipoCrud(): string {
    return this._tipoCrud;
  }
  estaAtiva(): boolean {
    return this._ativa;
  }
  ehSistema(): boolean {
    return this._nomeTabela.startsWith('TSI') || this._nomeTabela.startsWith('TDD');
  }
  equals(outra: Tabela): boolean {
    return outra ? this._nomeTabela === outra._nomeTabela : false;
  }
}
