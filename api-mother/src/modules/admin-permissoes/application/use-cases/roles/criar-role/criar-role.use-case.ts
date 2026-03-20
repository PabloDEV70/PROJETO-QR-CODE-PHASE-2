import { Injectable, Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';
import { Role } from '../../../../domain/entities/role.entity';

export interface CriarRoleEntrada {
  nomeRole: string;
  descricao?: string;
  ativo?: string;
}

export interface CriarRoleResultado {
  codRole: number;
  nomeRole: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: Date;
}

/**
 * Caso de uso para criar uma nova Role.
 */
@Injectable()
export class CriarRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorio: IRepositorioRole,
  ) {}

  async executar(entrada: CriarRoleEntrada): Promise<CriarRoleResultado> {
    // Verificar se ja existe role com mesmo nome
    const existeRole = await this.repositorio.existeComNome(entrada.nomeRole);
    if (existeRole) {
      throw new ConflictException(`Ja existe uma role com o nome '${entrada.nomeRole}'`);
    }

    // Criar entidade de dominio
    const roleOuErro = Role.criar({
      nomeRole: entrada.nomeRole,
      descricao: entrada.descricao,
      ativo: entrada.ativo || 'S',
      dataCriacao: new Date(),
    });

    if (roleOuErro.falhou) {
      throw new BadRequestException(roleOuErro.erro);
    }

    // Persistir
    const roleCriada = await this.repositorio.criar(roleOuErro.obterValor());

    return {
      codRole: roleCriada.codRole!,
      nomeRole: roleCriada.nomeRole,
      descricao: roleCriada.descricao,
      ativo: roleCriada.ativo,
      dataCriacao: roleCriada.dataCriacao!,
    };
  }
}
