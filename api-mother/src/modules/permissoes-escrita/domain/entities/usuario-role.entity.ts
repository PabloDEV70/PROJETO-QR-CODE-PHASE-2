import { Resultado } from '../../shared/resultado';

/**
 * Propriedades para criar uma associação UsuarioRole.
 */
export interface PropriedadesUsuarioRole {
  codUsuario: number;
  roleId: number;
  ativa: string;
  dataAtribuicao?: Date;
  dataExpiracao?: Date;
}

/**
 * Entidade que representa a associação entre um usuário e uma role.
 * Permite atribuir roles temporárias (com data de expiração).
 */
export class UsuarioRole {
  private constructor(
    private readonly _codUsuario: number,
    private readonly _roleId: number,
    private readonly _ativa: boolean,
    private readonly _dataAtribuicao: Date | null,
    private readonly _dataExpiracao: Date | null,
  ) {
    Object.freeze(this);
  }

  /**
   * Cria uma nova instância de UsuarioRole com validações.
   */
  static criar(props: PropriedadesUsuarioRole): Resultado<UsuarioRole> {
    if (!props.codUsuario || props.codUsuario <= 0) {
      return Resultado.falhar('Código do usuário inválido');
    }

    if (!props.roleId || props.roleId <= 0) {
      return Resultado.falhar('ID da role inválido');
    }

    // Validar que data de expiração é futura (se informada)
    if (props.dataExpiracao && props.dataExpiracao < new Date()) {
      return Resultado.falhar('Data de expiração deve ser uma data futura');
    }

    return Resultado.ok(
      new UsuarioRole(
        props.codUsuario,
        props.roleId,
        props.ativa?.toUpperCase() === 'S',
        props.dataAtribuicao || new Date(),
        props.dataExpiracao || null,
      ),
    );
  }

  get codUsuario(): number {
    return this._codUsuario;
  }

  get roleId(): number {
    return this._roleId;
  }

  get ativa(): boolean {
    return this._ativa;
  }

  get dataAtribuicao(): Date | null {
    return this._dataAtribuicao;
  }

  get dataExpiracao(): Date | null {
    return this._dataExpiracao;
  }

  /**
   * Verifica se a associação está ativa.
   */
  estaAtiva(): boolean {
    return this._ativa;
  }

  /**
   * Verifica se a associação expirou.
   */
  expirou(): boolean {
    if (!this._dataExpiracao) return false;
    return this._dataExpiracao < new Date();
  }

  /**
   * Verifica se a associação é temporária (tem data de expiração).
   */
  ehTemporaria(): boolean {
    return this._dataExpiracao !== null;
  }

  /**
   * Verifica se a associação está válida (ativa e não expirada).
   */
  estaValida(): boolean {
    return this._ativa && !this.expirou();
  }

  /**
   * Retorna dias restantes até expiração (ou null se permanente).
   */
  diasAteExpiracao(): number | null {
    if (!this._dataExpiracao) return null;
    const agora = new Date();
    const diff = this._dataExpiracao.getTime() - agora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  equals(outra: UsuarioRole): boolean {
    if (!outra) return false;
    return this._codUsuario === outra._codUsuario && this._roleId === outra._roleId;
  }

  toString(): string {
    return `UsuarioRole[${this._codUsuario}, ${this._roleId}]`;
  }
}
