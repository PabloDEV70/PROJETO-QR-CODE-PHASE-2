import { Resultado } from '../../shared/resultado';

/**
 * Propriedades para criar uma Role.
 */
export interface PropriedadesRole {
  codRole?: number;
  nomeRole: string;
  descricao?: string;
  ativo: string;
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

/**
 * Entidade de dominio representando uma Role/Papel no sistema.
 * Uma role agrupa permissoes que podem ser atribuidas a usuarios.
 */
export class Role {
  private constructor(
    private readonly _codRole: number | undefined,
    private readonly _nomeRole: string,
    private readonly _descricao: string | undefined,
    private readonly _ativo: boolean,
    private readonly _dataCriacao: Date | undefined,
    private readonly _dataAlteracao: Date | undefined,
  ) {
    Object.freeze(this);
  }

  static criar(props: PropriedadesRole): Resultado<Role> {
    if (!props.nomeRole || props.nomeRole.trim().length === 0) {
      return Resultado.falhar('Nome da role nao pode ser vazio');
    }
    if (props.nomeRole.length > 100) {
      return Resultado.falhar('Nome da role nao pode exceder 100 caracteres');
    }
    if (props.descricao && props.descricao.length > 500) {
      return Resultado.falhar('Descricao nao pode exceder 500 caracteres');
    }

    return Resultado.ok(
      new Role(
        props.codRole,
        props.nomeRole.trim(),
        props.descricao?.trim(),
        props.ativo?.toUpperCase() === 'S',
        props.dataCriacao,
        props.dataAlteracao,
      ),
    );
  }

  get codRole(): number | undefined {
    return this._codRole;
  }
  get nomeRole(): string {
    return this._nomeRole;
  }
  get descricao(): string | undefined {
    return this._descricao;
  }
  get ativo(): boolean {
    return this._ativo;
  }
  get dataCriacao(): Date | undefined {
    return this._dataCriacao;
  }
  get dataAlteracao(): Date | undefined {
    return this._dataAlteracao;
  }

  estaAtivo(): boolean {
    return this._ativo;
  }

  equals(outro: Role): boolean {
    if (!outro) return false;
    return this._codRole === outro._codRole;
  }
}
