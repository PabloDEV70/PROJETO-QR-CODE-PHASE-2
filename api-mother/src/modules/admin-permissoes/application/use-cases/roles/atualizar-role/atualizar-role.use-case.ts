import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';

export interface AtualizarRoleEntrada {
  codRole: number;
  nomeRole?: string;
  descricao?: string;
  ativo?: string;
}

export interface AtualizarRoleResultado {
  codRole: number;
  nomeRole: string;
  descricao?: string;
  ativo: boolean;
  dataAlteracao: Date;
}

/**
 * Caso de uso para atualizar uma Role existente.
 */
@Injectable()
export class AtualizarRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorio: IRepositorioRole,
  ) {}

  async executar(entrada: AtualizarRoleEntrada): Promise<AtualizarRoleResultado> {
    // Buscar role existente
    const roleExistente = await this.repositorio.buscarPorCodigo(entrada.codRole);
    if (!roleExistente) {
      throw new NotFoundException(`Role com codigo ${entrada.codRole} nao encontrada`);
    }

    // Verificar se novo nome ja existe (se foi alterado)
    if (entrada.nomeRole && entrada.nomeRole !== roleExistente.nomeRole) {
      const existeNome = await this.repositorio.existeComNome(entrada.nomeRole, entrada.codRole);
      if (existeNome) {
        throw new ConflictException(`Ja existe uma role com o nome '${entrada.nomeRole}'`);
      }
    }

    // Criar entidade atualizada
    const roleOuErro = Role.criar({
      codRole: entrada.codRole,
      nomeRole: entrada.nomeRole || roleExistente.nomeRole,
      descricao: entrada.descricao !== undefined ? entrada.descricao : roleExistente.descricao,
      ativo: entrada.ativo !== undefined ? entrada.ativo : roleExistente.ativo ? 'S' : 'N',
      dataCriacao: roleExistente.dataCriacao,
      dataAlteracao: new Date(),
    });

    if (roleOuErro.falhou) {
      throw new BadRequestException(roleOuErro.erro);
    }

    // Persistir
    const roleAtualizada = await this.repositorio.atualizar(roleOuErro.obterValor());

    return {
      codRole: roleAtualizada.codRole!,
      nomeRole: roleAtualizada.nomeRole,
      descricao: roleAtualizada.descricao,
      ativo: roleAtualizada.ativo,
      dataAlteracao: roleAtualizada.dataAlteracao!,
    };
  }
}
