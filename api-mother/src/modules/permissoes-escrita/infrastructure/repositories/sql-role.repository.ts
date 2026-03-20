import { Injectable } from '@nestjs/common';
import { IRepositorioRole } from '../../domain/repositories/role.repository.interface';
import { Role } from '../../domain/entities/role.entity';
import { UsuarioRole } from '../../domain/entities/usuario-role.entity';
import { SqlServerService } from '../../../../database/sqlserver.service';
import {
  ObterRolesUsuarioQuery,
  ListarRolesAtivasQuery,
  ListarTodasRolesQuery,
  BuscarRolePorIdQuery,
  BuscarRolePorNomeQuery,
  BuscarAssociacaoUsuarioRoleQuery,
  ListarAssociacoesUsuarioQuery,
  ListarUsuariosDaRoleQuery,
} from '../queries/obter-roles-usuario.query';

/**
 * Interface para dados crus de Role do banco de dados.
 */
interface RoleCru {
  roleId: number;
  nome: string;
  descricao: string | null;
  ativa: string;
  dataCriacao: Date | null;
  dataAtualizacao: Date | null;
}

/**
 * Interface para dados crus de UsuarioRole do banco de dados.
 */
interface UsuarioRoleCru {
  codUsuario: number;
  roleId: number;
  ativa: string;
  dataAtribuicao: Date | null;
  dataExpiracao: Date | null;
}

/**
 * Implementação do repositório de roles usando SQL Server.
 */
@Injectable()
export class SqlRoleRepository implements IRepositorioRole {
  constructor(private readonly sqlServer: SqlServerService) {}

  async buscarPorId(roleId: number): Promise<Role | null> {
    const query = new BuscarRolePorIdQuery(roleId);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (!resultado || resultado.length === 0) {
      return null;
    }

    return this.mapearRoleParaDominio(resultado[0] as RoleCru);
  }

  async buscarPorNome(nome: string): Promise<Role | null> {
    const query = new BuscarRolePorNomeQuery(nome);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (!resultado || resultado.length === 0) {
      return null;
    }

    return this.mapearRoleParaDominio(resultado[0] as RoleCru);
  }

  async listarAtivas(): Promise<Role[]> {
    const query = new ListarRolesAtivasQuery();
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearListaRoles(resultado as RoleCru[]);
  }

  async listarTodas(): Promise<Role[]> {
    const query = new ListarTodasRolesQuery();
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearListaRoles(resultado as RoleCru[]);
  }

  async buscarRolesDoUsuario(codUsuario: number): Promise<Role[]> {
    const query = new ObterRolesUsuarioQuery(codUsuario);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearListaRoles(resultado as RoleCru[]);
  }

  async buscarAssociacaoUsuarioRole(codUsuario: number, roleId: number): Promise<UsuarioRole | null> {
    const query = new BuscarAssociacaoUsuarioRoleQuery(codUsuario, roleId);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);

    if (!resultado || resultado.length === 0) {
      return null;
    }

    return this.mapearUsuarioRoleParaDominio(resultado[0] as UsuarioRoleCru);
  }

  async listarAssociacoesDoUsuario(codUsuario: number): Promise<UsuarioRole[]> {
    const query = new ListarAssociacoesUsuarioQuery(codUsuario);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearListaUsuarioRoles(resultado as UsuarioRoleCru[]);
  }

  async listarUsuariosDaRole(roleId: number): Promise<UsuarioRole[]> {
    const query = new ListarUsuariosDaRoleQuery(roleId);
    const resultado = await this.sqlServer.executeSQL(query.sql, query.parametros);
    return this.mapearListaUsuarioRoles(resultado as UsuarioRoleCru[]);
  }

  private mapearListaRoles(registros: RoleCru[]): Role[] {
    if (!registros || registros.length === 0) {
      return [];
    }
    return registros.map((r) => this.mapearRoleParaDominio(r));
  }

  private mapearRoleParaDominio(cru: RoleCru): Role {
    const resultado = Role.criar({
      roleId: cru.roleId,
      nome: cru.nome,
      descricao: cru.descricao || undefined,
      ativa: cru.ativa,
      dataCriacao: cru.dataCriacao || undefined,
      dataAtualizacao: cru.dataAtualizacao || undefined,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear role: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }

  private mapearListaUsuarioRoles(registros: UsuarioRoleCru[]): UsuarioRole[] {
    if (!registros || registros.length === 0) {
      return [];
    }
    return registros.map((r) => this.mapearUsuarioRoleParaDominio(r));
  }

  private mapearUsuarioRoleParaDominio(cru: UsuarioRoleCru): UsuarioRole {
    const resultado = UsuarioRole.criar({
      codUsuario: cru.codUsuario,
      roleId: cru.roleId,
      ativa: cru.ativa,
      dataAtribuicao: cru.dataAtribuicao || undefined,
      dataExpiracao: cru.dataExpiracao || undefined,
    });

    if (resultado.falhou) {
      throw new Error(`Erro ao mapear associação usuário-role: ${resultado.erro}`);
    }

    return resultado.obterValor();
  }
}
