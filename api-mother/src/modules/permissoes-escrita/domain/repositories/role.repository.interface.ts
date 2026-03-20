import { Role } from '../entities/role.entity';
import { UsuarioRole } from '../entities/usuario-role.entity';

export const REPOSITORIO_ROLE = Symbol('IRepositorioRole');

/**
 * Interface do repositório de roles.
 * Define operações de consulta para roles e associações com usuários.
 */
export interface IRepositorioRole {
  /**
   * Busca uma role pelo ID.
   */
  buscarPorId(roleId: number): Promise<Role | null>;

  /**
   * Busca uma role pelo nome.
   */
  buscarPorNome(nome: string): Promise<Role | null>;

  /**
   * Lista todas as roles ativas.
   */
  listarAtivas(): Promise<Role[]>;

  /**
   * Lista todas as roles (ativas e inativas).
   */
  listarTodas(): Promise<Role[]>;

  /**
   * Busca todas as roles atribuídas a um usuário.
   * Retorna apenas associações válidas (ativas e não expiradas).
   */
  buscarRolesDoUsuario(codUsuario: number): Promise<Role[]>;

  /**
   * Busca a associação específica entre um usuário e uma role.
   */
  buscarAssociacaoUsuarioRole(codUsuario: number, roleId: number): Promise<UsuarioRole | null>;

  /**
   * Lista todas as associações de um usuário com roles.
   */
  listarAssociacoesDoUsuario(codUsuario: number): Promise<UsuarioRole[]>;

  /**
   * Lista todos os usuários com uma determinada role.
   */
  listarUsuariosDaRole(roleId: number): Promise<UsuarioRole[]>;
}
