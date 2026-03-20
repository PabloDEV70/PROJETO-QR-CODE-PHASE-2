import { Injectable, Inject } from '@nestjs/common';
import {
  IRepositorioPermissaoEscrita,
  REPOSITORIO_PERMISSAO_ESCRITA,
} from '../../../domain/repositories/permissao-escrita.repository.interface';
import { IRepositorioRole, REPOSITORIO_ROLE } from '../../../domain/repositories/role.repository.interface';
import { PermissaoEscrita } from '../../../domain/entities/permissao-escrita.entity';
import { Role } from '../../../domain/entities/role.entity';

/**
 * Entrada para obter permissões do usuário.
 */
export interface ObterPermissoesUsuarioEntrada {
  codUsuario: number;
  apenasAtivas?: boolean;
  tabela?: string;
}

/**
 * DTO de permissão para resposta.
 */
export interface PermissaoDto {
  permissaoId: number;
  tabela: string;
  operacao: string;
  operacaoDescricao: string;
  condicaoRLS: string | null;
  ativa: boolean;
  descricao: string | null;
  requerAprovacao: boolean;
  dataValidade: Date | null;
  tipoPermissao: 'DIRETA' | 'VIA_ROLE';
  roleNome?: string;
}

/**
 * DTO de role para resposta.
 */
export interface RoleDto {
  roleId: number;
  nome: string;
  descricao: string | null;
  ativa: boolean;
}

/**
 * Saída com permissões do usuário.
 */
export interface ObterPermissoesUsuarioSaida {
  codUsuario: number;
  permissoes: PermissaoDto[];
  roles: RoleDto[];
  totalPermissoes: number;
  totalRoles: number;
  resumoPorTabela: Record<string, string[]>;
}

/**
 * Use Case para obter todas as permissões de escrita de um usuário.
 *
 * Retorna:
 * - Lista de permissões (diretas e via roles)
 * - Roles atribuídas ao usuário
 * - Resumo de operações por tabela
 */
@Injectable()
export class ObterPermissoesUsuarioUseCase {
  constructor(
    @Inject(REPOSITORIO_PERMISSAO_ESCRITA)
    private readonly repositorioPermissao: IRepositorioPermissaoEscrita,
    @Inject(REPOSITORIO_ROLE)
    private readonly repositorioRole: IRepositorioRole,
  ) {}

  async executar(entrada: ObterPermissoesUsuarioEntrada): Promise<ObterPermissoesUsuarioSaida> {
    const { codUsuario, tabela } = entrada;

    // 1. Buscar permissões do usuário
    let permissoes: PermissaoEscrita[];
    if (tabela) {
      permissoes = await this.repositorioPermissao.buscarPorUsuarioETabela(codUsuario, tabela);
    } else {
      permissoes = await this.repositorioPermissao.buscarPorUsuario(codUsuario);
    }

    // 2. Buscar roles do usuário
    const roles = await this.repositorioRole.buscarRolesDoUsuario(codUsuario);

    // 3. Mapear permissões para DTOs
    const permissoesDto = permissoes.map((p) => this.mapearPermissaoParaDto(p, roles));

    // 4. Mapear roles para DTOs
    const rolesDto = roles.map((r) => this.mapearRoleParaDto(r));

    // 5. Criar resumo por tabela
    const resumoPorTabela = this.criarResumoPorTabela(permissoes);

    return {
      codUsuario,
      permissoes: permissoesDto,
      roles: rolesDto,
      totalPermissoes: permissoesDto.length,
      totalRoles: rolesDto.length,
      resumoPorTabela,
    };
  }

  private mapearPermissaoParaDto(permissao: PermissaoEscrita, roles: Role[]): PermissaoDto {
    let roleNome: string | undefined;
    let tipoPermissao: 'DIRETA' | 'VIA_ROLE' = 'DIRETA';

    if (permissao.roleId) {
      tipoPermissao = 'VIA_ROLE';
      const role = roles.find((r) => r.roleId === permissao.roleId);
      roleNome = role?.nome;
    }

    return {
      permissaoId: permissao.permissaoId,
      tabela: permissao.tabela,
      operacao: permissao.operacaoSigla,
      operacaoDescricao: permissao.operacao.descricao,
      condicaoRLS: permissao.condicaoRLS.valor,
      ativa: permissao.ativa,
      descricao: permissao.descricao,
      requerAprovacao: permissao.requerAprovacao,
      dataValidade: permissao.dataValidade,
      tipoPermissao,
      roleNome,
    };
  }

  private mapearRoleParaDto(role: Role): RoleDto {
    return {
      roleId: role.roleId,
      nome: role.nome,
      descricao: role.descricao,
      ativa: role.ativa,
    };
  }

  private criarResumoPorTabela(permissoes: PermissaoEscrita[]): Record<string, string[]> {
    const resumo: Record<string, string[]> = {};

    for (const permissao of permissoes) {
      if (!resumo[permissao.tabela]) {
        resumo[permissao.tabela] = [];
      }

      const op = permissao.operacao.descricao;
      if (!resumo[permissao.tabela].includes(op)) {
        resumo[permissao.tabela].push(op);
      }
    }

    // Ordenar operações
    for (const tabela of Object.keys(resumo)) {
      resumo[tabela].sort();
    }

    return resumo;
  }
}
