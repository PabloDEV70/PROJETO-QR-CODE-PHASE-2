import { Resultado } from '../../shared/resultado';

export interface PropriedadesOpcaoCampo {
  nomeTabela: string;
  nomeCampo: string;
  valor: string;
  descricao: string;
  ordem?: number;
}

export class OpcaoCampo {
  private constructor(
    private readonly _nomeTabela: string,
    private readonly _nomeCampo: string,
    private readonly _valor: string,
    private readonly _descricao: string,
    private readonly _ordem: number,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesOpcaoCampo): Resultado<OpcaoCampo> {
    if (!props.nomeTabela || !props.nomeCampo) {
      return Resultado.falhar('Nome da tabela e do campo são obrigatórios');
    }
    if (props.valor === undefined || props.valor === null) {
      return Resultado.falhar('Valor da opção é obrigatório');
    }
    return Resultado.ok(
      new OpcaoCampo(
        props.nomeTabela.toUpperCase(),
        props.nomeCampo.toUpperCase(),
        props.valor,
        props.descricao?.trim() || props.valor,
        props.ordem || 0,
      ),
    );
  }

  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get nomeCampo(): string {
    return this._nomeCampo;
  }
  get valor(): string {
    return this._valor;
  }
  get descricao(): string {
    return this._descricao;
  }
  get ordem(): number {
    return this._ordem;
  }

  equals(outra: OpcaoCampo): boolean {
    return outra
      ? this._nomeTabela === outra._nomeTabela && this._nomeCampo === outra._nomeCampo && this._valor === outra._valor
      : false;
  }
}
