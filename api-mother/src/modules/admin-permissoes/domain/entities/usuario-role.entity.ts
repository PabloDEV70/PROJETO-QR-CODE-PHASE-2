import { Resultado } from '../../shared/resultado';

/**
 * Propriedades para associacao Usuario-Role.
 */
export interface PropriedadesUsuarioRole {
  codUsuario: number;
  codRole: number;
  nomeUsuario?: string;
  nomeRole?: string;
  dataAssociacao?: Date;
  ativo: string;
}

/**
 * Entidade de dominio representando a associacao entre Usuario e Role.
 */
export class UsuarioRole {
  private constructor(
    private readonly _codUsuario: number,
    private readonly _codRole: number,
    private readonly _nomeUsuario: string | undefined,
    private readonly _nomeRole: string | undefined,
    private readonly _dataAssociacao: Date | undefined,
    private readonly _ativo: boolean,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesUsuarioRole): Resultado<UsuarioRole> {
    if (!props.codUsuario || props.codUsuario <= 0) {
      return Resultado.falhar('Codigo do usuario invalido');
    }
    if (!props.codRole || props.codRole <= 0) {
      return Resultado.falhar('Codigo da role invalido');
    }

    return Resultado.ok(
      new UsuarioRole(
        props.codUsuario,
        props.codRole,
        props.nomeUsuario,
        props.nomeRole,
        props.dataAssociacao,
        props.ativo?.toUpperCase() === 'S',
      ),
    );
  }

  get codUsuario(): number {
    return this._codUsuario;
  }
  get codRole(): number {
    return this._codRole;
  }
  get nomeUsuario(): string | undefined {
    return this._nomeUsuario;
  }
  get nomeRole(): string | undefined {
    return this._nomeRole;
  }
  get dataAssociacao(): Date | undefined {
    return this._dataAssociacao;
  }
  get ativo(): boolean {
    return this._ativo;
  }

  estaAtivo(): boolean {
    return this._ativo;
  }

  equals(outro: UsuarioRole): boolean {
    if (!outro) return false;
    return this._codUsuario === outro._codUsuario && this._codRole === outro._codRole;
  }
}
