import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioUsuarioRole,
  REPOSITORIO_USUARIO_ROLE,
} from '../../../../domain/repositories/usuario-role.repository.interface';
import { UsuarioRole } from '../../../../domain/entities/usuario-role.entity';

export interface ListarUsuariosRoleEntrada {
  codRole?: number;
  codUsuario?: number;
}

export interface UsuarioRoleDto {
  codUsuario: number;
  codRole: number;
  nomeUsuario?: string;
  nomeRole?: string;
  dataAssociacao?: Date;
  ativo: boolean;
}

export interface ListarUsuariosRoleResultado {
  associacoes: UsuarioRoleDto[];
  total: number;
}

/**
 * Caso de uso para listar associacoes Usuario-Role.
 */
@Injectable()
export class ListarUsuariosRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_USUARIO_ROLE)
    private readonly repositorio: IRepositorioUsuarioRole,
  ) {}

  async executar(entrada: ListarUsuariosRoleEntrada): Promise<ListarUsuariosRoleResultado> {
    let associacoes: UsuarioRole[];

    if (entrada.codRole) {
      associacoes = await this.repositorio.buscarPorRole(entrada.codRole);
    } else if (entrada.codUsuario) {
      associacoes = await this.repositorio.buscarPorUsuario(entrada.codUsuario);
    } else {
      associacoes = await this.repositorio.listarUsuariosComRoles();
    }

    return {
      associacoes: associacoes.map((a) => this.paraDto(a)),
      total: associacoes.length,
    };
  }

  private paraDto(usuarioRole: UsuarioRole): UsuarioRoleDto {
    return {
      codUsuario: usuarioRole.codUsuario,
      codRole: usuarioRole.codRole,
      nomeUsuario: usuarioRole.nomeUsuario,
      nomeRole: usuarioRole.nomeRole,
      dataAssociacao: usuarioRole.dataAssociacao,
      ativo: usuarioRole.ativo,
    };
  }
}
