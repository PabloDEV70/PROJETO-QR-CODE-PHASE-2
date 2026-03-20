import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';

export interface RemoverRoleEntrada {
  codRole: number;
}

export interface RemoverRoleResultado {
  sucesso: boolean;
  mensagem: string;
}

/**
 * Caso de uso para remover (desativar) uma Role.
 */
@Injectable()
export class RemoverRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorio: IRepositorioRole,
  ) {}

  async executar(entrada: RemoverRoleEntrada): Promise<RemoverRoleResultado> {
    // Verificar se role existe
    const roleExistente = await this.repositorio.buscarPorCodigo(entrada.codRole);
    if (!roleExistente) {
      throw new NotFoundException(`Role com codigo ${entrada.codRole} nao encontrada`);
    }

    // Remover (soft delete)
    await this.repositorio.remover(entrada.codRole);

    return {
      sucesso: true,
      mensagem: `Role '${roleExistente.nomeRole}' removida com sucesso`,
    };
  }
}
