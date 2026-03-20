import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IRepositorioUsuarioRole,
  REPOSITORIO_USUARIO_ROLE,
} from '../../../../domain/repositories/usuario-role.repository.interface';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../../domain/repositories/role.repository.interface';
import { UsuarioRole } from '../../../../domain/entities/usuario-role.entity';

export interface AssociarUsuarioRoleEntrada {
  codUsuario: number;
  codRole: number;
}

export interface AssociarUsuarioRoleResultado {
  codUsuario: number;
  codRole: number;
  nomeRole?: string;
  dataAssociacao: Date;
  mensagem: string;
}

/**
 * Caso de uso para associar um usuario a uma role.
 */
@Injectable()
export class AssociarUsuarioRoleUseCase {
  constructor(
    @Inject(REPOSITORIO_USUARIO_ROLE)
    private readonly repositorioUsuarioRole: IRepositorioUsuarioRole,
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorioRole: IRepositorioRole,
  ) {}

  async executar(entrada: AssociarUsuarioRoleEntrada): Promise<AssociarUsuarioRoleResultado> {
    // Verificar se role existe
    const role = await this.repositorioRole.buscarPorCodigo(entrada.codRole);
    if (!role) {
      throw new NotFoundException(`Role com codigo ${entrada.codRole} nao encontrada`);
    }

    // Verificar se role esta ativa
    if (!role.estaAtivo()) {
      throw new BadRequestException(`Role '${role.nomeRole}' esta inativa`);
    }

    // Verificar se ja existe associacao
    const existeAssociacao = await this.repositorioUsuarioRole.existeAssociacao(entrada.codUsuario, entrada.codRole);
    if (existeAssociacao) {
      throw new ConflictException(`Usuario ${entrada.codUsuario} ja esta associado a role '${role.nomeRole}'`);
    }

    // Criar entidade de dominio
    const usuarioRoleOuErro = UsuarioRole.criar({
      codUsuario: entrada.codUsuario,
      codRole: entrada.codRole,
      nomeRole: role.nomeRole,
      dataAssociacao: new Date(),
      ativo: 'S',
    });

    if (usuarioRoleOuErro.falhou) {
      throw new BadRequestException(usuarioRoleOuErro.erro);
    }

    // Persistir
    const associacao = await this.repositorioUsuarioRole.associar(usuarioRoleOuErro.obterValor());

    return {
      codUsuario: associacao.codUsuario,
      codRole: associacao.codRole,
      nomeRole: role.nomeRole,
      dataAssociacao: associacao.dataAssociacao!,
      mensagem: `Usuario ${entrada.codUsuario} associado a role '${role.nomeRole}' com sucesso`,
    };
  }
}
