import { Role } from '../entities/role.entity';

export const REPOSITORIO_ROLE = Symbol('IRepositorioRole');

/**
 * Interface do repositorio de Roles.
 */
export interface IRepositorioRole {
  /**
   * Busca todas as roles.
   */
  buscarTodas(): Promise<Role[]>;

  /**
   * Busca roles ativas.
   */
  buscarAtivas(): Promise<Role[]>;

  /**
   * Busca role por codigo.
   */
  buscarPorCodigo(codRole: number): Promise<Role | null>;

  /**
   * Busca role por nome.
   */
  buscarPorNome(nomeRole: string): Promise<Role | null>;

  /**
   * Cria uma nova role.
   */
  criar(role: Role): Promise<Role>;

  /**
   * Atualiza uma role existente.
   */
  atualizar(role: Role): Promise<Role>;

  /**
   * Remove uma role (soft delete - desativa).
   */
  remover(codRole: number): Promise<void>;

  /**
   * Verifica se existe role com o nome.
   */
  existeComNome(nomeRole: string, excluirCodigo?: number): Promise<boolean>;
}
