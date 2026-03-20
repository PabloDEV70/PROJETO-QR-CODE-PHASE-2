import { Resultado } from '../../shared/resultado';

export interface PropriedadesPropriedadeCampo {
  nomeTabela: string;
  nomeCampo: string;
  nomePropriedade: string;
  valorPropriedade: string;
}

export class PropriedadeCampo {
  private constructor(
    private readonly _nomeTabela: string,
    private readonly _nomeCampo: string,
    private readonly _nomePropriedade: string,
    private readonly _valorPropriedade: string,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesPropriedadeCampo): Resultado<PropriedadeCampo> {
    if (!props.nomeTabela || !props.nomeCampo || !props.nomePropriedade) {
      return Resultado.falhar('Tabela, campo e nome da propriedade são obrigatórios');
    }
    return Resultado.ok(
      new PropriedadeCampo(
        props.nomeTabela.toUpperCase(),
        props.nomeCampo.toUpperCase(),
        props.nomePropriedade.trim(),
        props.valorPropriedade ?? '',
      ),
    );
  }

  get nomeTabela(): string {
    return this._nomeTabela;
  }
  get nomeCampo(): string {
    return this._nomeCampo;
  }
  get nomePropriedade(): string {
    return this._nomePropriedade;
  }
  get valorPropriedade(): string {
    return this._valorPropriedade;
  }

  obterValorBooleano(): boolean {
    return (
      this._valorPropriedade.toUpperCase() === 'S' ||
      this._valorPropriedade === '1' ||
      this._valorPropriedade.toLowerCase() === 'true'
    );
  }

  equals(outra: PropriedadeCampo): boolean {
    return outra
      ? this._nomeTabela === outra._nomeTabela &&
          this._nomeCampo === outra._nomeCampo &&
          this._nomePropriedade === outra._nomePropriedade
      : false;
  }
}
