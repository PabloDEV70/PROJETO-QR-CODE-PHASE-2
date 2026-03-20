import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IRepositorioUsuarioRole,
  REPOSITORIO_USUARIO_ROLE,
} from '../../../../domain/repositories/usuario-role.repository.interface';

export interface DesassociarUsuarioRoleEntrada {
  codUsuario: number;
  codRole: number;
}

export interface DesassociarUsuarioRoleResultado {
  sucesso: boolean;
  mensagem: string;
}

/**
 * Caso de uso para desassociar um usuario de uma role.
 */
@Injectable()
export class DesassociarUsuarioRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_USUARIO_ROLE)
    private readonly repositorio: IRepositorioUsuarioRole,
  ) {}

  async executar(entrada: DesassociarUsuarioRoleEntrada): Promise<DesassociarUsuarioRoleResultado> {
    // Verificar se existe associacao
    const existeAssociacao = await this.repositorio.existeAssociacao(entrada.codUsuario, entrada.codRole);
    if (!existeAssociacao) {
      throw new NotFoundException(
        `Associacao entre usuario ${entrada.codUsuario} e role ${entrada.codRole} nao encontrada`,
      );
    }

    // Remover associacao
    await this.repositorio.desassociar(entrada.codUsuario, entrada.codRole);

    return {
      sucesso: true,
      mensagem: `Usuario ${entrada.codUsuario} desassociado da role ${entrada.codRole} com sucesso`,
    };
  }
}
