import { Resultado } from '../../shared/resultado';

export interface PropriedadesControleUI {
  codUsuario: number;
  codTela: number;
  nomeControle: string;
  habilitado: string;
  visivel: string;
  obrigatorio?: string;
  somenteLeitura?: string;
}

export class ControleUI {
  private constructor(
    private readonly _codUsuario: number,
    private readonly _codTela: number,
    private readonly _nomeControle: string,
    private readonly _habilitado: boolean,
    private readonly _visivel: boolean,
    private readonly _obrigatorio: boolean,
    private readonly _somenteLeitura: boolean,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesControleUI): Resultado<ControleUI> {
    if (!props.codUsuario || props.codUsuario <= 0) {
      return Resultado.falhar('Código do usuário inválido');
    }
    if (!props.codTela || props.codTela <= 0) {
      return Resultado.falhar('Código da tela inválido');
    }
    if (!props.nomeControle || props.nomeControle.trim().length === 0) {
      return Resultado.falhar('Nome do controle não pode ser vazio');
    }

    return Resultado.ok(
      new ControleUI(
        props.codUsuario,
        props.codTela,
        props.nomeControle.trim(),
        props.habilitado?.toUpperCase() === 'S',
        props.visivel?.toUpperCase() === 'S',
        props.obrigatorio?.toUpperCase() === 'S',
        props.somenteLeitura?.toUpperCase() === 'S',
      ),
    );
  }

  get codUsuario(): number {
    return this._codUsuario;
  }
  get codTela(): number {
    return this._codTela;
  }
  get nomeControle(): string {
    return this._nomeControle;
  }
  get habilitado(): boolean {
    return this._habilitado;
  }
  get visivel(): boolean {
    return this._visivel;
  }
  get obrigatorio(): boolean {
    return this._obrigatorio;
  }
  get somenteLeitura(): boolean {
    return this._somenteLeitura;
  }

  estaAcessivel(): boolean {
    return this._habilitado && this._visivel;
  }
  permiteEdicao(): boolean {
    return this._habilitado && !this._somenteLeitura;
  }
  requerPreenchimento(): boolean {
    return this._obrigatorio && this._visivel;
  }

  equals(outro: ControleUI): boolean {
    if (!outro) return false;
    return (
      this._codUsuario === outro._codUsuario &&
      this._codTela === outro._codTela &&
      this._nomeControle === outro._nomeControle
    );
  }
}
