import { Resultado } from '../../shared/resultado';
import { TipoLigacao } from '../value-objects/tipo-ligacao.vo';

export interface PropriedadesRelacionamento {
  nomeInstanciaPai: string;
  nomeInstanciaFilho: string;
  tipoLigacao: string;
  ordem?: number;
  ativo?: string;
}

export class Relacionamento {
  private constructor(
    private readonly _nomeInstanciaPai: string,
    private readonly _nomeInstanciaFilho: string,
    private readonly _tipoLigacao: TipoLigacao,
    private readonly _ordem: number,
    private readonly _ativo: boolean,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesRelacionamento): Resultado<Relacionamento> {
    if (!props.nomeInstanciaPai || !props.nomeInstanciaFilho) {
      return Resultado.falhar('Instâncias pai e filho são obrigatórias');
    }
    const tipoResult = TipoLigacao.criar(props.tipoLigacao || 'M');
    if (tipoResult.falhou) return Resultado.falhar(tipoResult.erro!);

    return Resultado.ok(
      new Relacionamento(
        props.nomeInstanciaPai.trim(),
        props.nomeInstanciaFilho.trim(),
        tipoResult.obterValor(),
        props.ordem || 0,
        props.ativo?.toUpperCase() !== 'N',
      ),
    );
  }

  get nomeInstanciaPai(): string {
    return this._nomeInstanciaPai;
  }
  get nomeInstanciaFilho(): string {
    return this._nomeInstanciaFilho;
  }
  get tipoLigacao(): TipoLigacao {
    return this._tipoLigacao;
  }
  get ordem(): number {
    return this._ordem;
  }
  get ativo(): boolean {
    return this._ativo;
  }
  ehMasterDetail(): boolean {
    return this._tipoLigacao.ehMaster();
  }
  estaAtivo(): boolean {
    return this._ativo;
  }
  equals(outro: Relacionamento): boolean {
    return outro
      ? this._nomeInstanciaPai === outro._nomeInstanciaPai && this._nomeInstanciaFilho === outro._nomeInstanciaFilho
      : false;
  }
}
