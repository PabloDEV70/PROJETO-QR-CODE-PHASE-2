import { Resultado } from '../../shared/resultado';

/**
 * Propriedades para criar uma Role.
 */
export interface PropriedadesRole {
  roleId: number;
  nome: string;
  descricao?: string;
  ativa: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

/**
 * Entidade que representa uma Role (papel/perfil) de permissões.
 * Roles agrupam permissões e podem ser atribuídas a usuários.
 */
export class Role {
  private constructor(
    private readonly _roleId: number,
    private readonly _nome: string,
    private readonly _descricao: string | null,
    private readonly _ativa: boolean,
    private readonly _dataCriacao: Date | null,
    private readonly _dataAtualizacao: Date | null,
  ) {
    Object.freeze(this);
  }

  /**
   * Cria uma nova instância de Role com validações.
   */
  static criar(props: PropriedadesRole): Resultado<Role> {
    if (!props.roleId || props.roleId <= 0) {
      return Resultado.falhar('ID da role inválido');
    }

    if (!props.nome || props.nome.trim().length === 0) {
      return Resultado.falhar('Nome da role não pode ser vazio');
    }

    if (props.nome.trim().length > 100) {
      return Resultado.falhar('Nome da role não pode ter mais de 100 caracteres');
    }

    if (props.descricao && props.descricao.length > 500) {
      return Resultado.falhar('Descrição da role não pode ter mais de 500 caracteres');
    }

    return Resultado.ok(
      new Role(
        props.roleId,
        props.nome.trim(),
        props.descricao?.trim() || null,
        props.ativa?.toUpperCase() === 'S',
        props.dataCriacao || null,
        props.dataAtualizacao || null,
      ),
    );
  }

  get roleId(): number {
    return this._roleId;
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get ativa(): boolean {
    return this._ativa;
  }

  get dataCriacao(): Date | null {
    return this._dataCriacao;
  }

  get dataAtualizacao(): Date | null {
    return this._dataAtualizacao;
  }

  /**
   * Verifica se a role está ativa.
   */
  estaAtiva(): boolean {
    return this._ativa;
  }

  /**
   * Verifica se a role pode ser atribuída a usuários.
   */
  podeSerAtribuida(): boolean {
    return this._ativa;
  }

  equals(outra: Role): boolean {
    if (!outra) return false;
    return this._roleId === outra._roleId;
  }

  toString(): string {
    return `Role[${this._roleId}]: ${this._nome}`;
  }
}
