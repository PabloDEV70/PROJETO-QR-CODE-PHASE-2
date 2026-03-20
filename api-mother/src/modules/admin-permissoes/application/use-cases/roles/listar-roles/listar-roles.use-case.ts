import { Injectable, Inject } from '@nestjs/common';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';

export interface ListarRolesEntrada {
  apenasAtivas?: boolean;
}

export interface RoleDto {
  codRole: number;
  nomeRole: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao?: Date;
  dataAlteracao?: Date;
}

export interface ListarRolesResultado {
  roles: RoleDto[];
  total: number;
}

/**
 * Caso de uso para listar Roles.
 */
@Injectable()
export class ListarRolesUseCase {
  constructor(
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorio: IRepositorioRole,
  ) {}

  async executar(entrada: ListarRolesEntrada): Promise<ListarRolesResultado> {
    let roles: Role[];

    if (entrada.apenasAtivas) {
      roles = await this.repositorio.buscarAtivas();
    } else {
      roles = await this.repositorio.buscarTodas();
    }

    return {
      roles: roles.map((r) => this.paraDto(r)),
      total: roles.length,
    };
  }

  private paraDto(role: Role): RoleDto {
    return {
      codRole: role.codRole!,
      nomeRole: role.nomeRole,
      descricao: role.descricao,
      ativo: role.ativo,
      dataCriacao: role.dataCriacao,
      dataAlteracao: role.dataAlteracao,
    };
  }
}
