import { Resultado } from '../../shared/resultado';

export interface PropriedadesLinkCampo {
  nomeInstanciaPai: string;
  nomeInstanciaFilho: string;
  campoOrigem: string;
  campoDestino: string;
  ordem?: number;
}

export class LinkCampo {
  private constructor(
    private readonly _nomeInstanciaPai: string,
    private readonly _nomeInstanciaFilho: string,
    private readonly _campoOrigem: string,
    private readonly _campoDestino: string,
    private readonly _ordem: number,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesLinkCampo): Resultado<LinkCampo> {
    if (!props.nomeInstanciaPai || !props.nomeInstanciaFilho) {
      return Resultado.falhar('Instâncias pai e filho são obrigatórias');
    }
    if (!props.campoOrigem || !props.campoDestino) {
      return Resultado.falhar('Campos origem e destino são obrigatórios');
    }
    return Resultado.ok(
      new LinkCampo(
        props.nomeInstanciaPai.trim(),
        props.nomeInstanciaFilho.trim(),
        props.campoOrigem.toUpperCase(),
        props.campoDestino.toUpperCase(),
        props.ordem || 0,
      ),
    );
  }

  get nomeInstanciaPai(): string {
    return this._nomeInstanciaPai;
  }
  get nomeInstanciaFilho(): string {
    return this._nomeInstanciaFilho;
  }
  get campoOrigem(): string {
    return this._campoOrigem;
  }
  get campoDestino(): string {
    return this._campoDestino;
  }
  get ordem(): number {
    return this._ordem;
  }
  obterExpressaoJoin(): string {
    return `pai.${this._campoOrigem} = filho.${this._campoDestino}`;
  }
  equals(outro: LinkCampo): boolean {
    return outro
      ? this._nomeInstanciaPai === outro._nomeInstanciaPai &&
          this._nomeInstanciaFilho === outro._nomeInstanciaFilho &&
          this._campoOrigem === outro._campoOrigem &&
          this._campoDestino === outro._campoDestino
      : false;
  }
}
