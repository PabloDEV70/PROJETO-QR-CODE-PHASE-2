import { UsuarioRole } from '../entities/usuario-role.entity';

export const REPOSITORIO_USUARIO_ROLE = Symbol('IRepositorioUsuarioRole');

/**
 * Interface do repositorio de associacoes Usuario-Role.
 */
export interface IRepositorioUsuarioRole {
  /**
   * Busca todas as associacoes de uma role.
   */
  buscarPorRole(codRole: number): Promise<UsuarioRole[]>;

  /**
   * Busca todas as roles de um usuario.
   */
  buscarPorUsuario(codUsuario: number): Promise<UsuarioRole[]>;

  /**
   * Verifica se existe associacao entre usuario e role.
   */
  existeAssociacao(codUsuario: number, codRole: number): Promise<boolean>;

  /**
   * Cria associacao entre usuario e role.
   */
  associar(usuarioRole: UsuarioRole): Promise<UsuarioRole>;

  /**
   * Remove associacao entre usuario e role.
   */
  desassociar(codUsuario: number, codRole: number): Promise<void>;

  /**
   * Lista usuarios com suas roles.
   */
  listarUsuariosComRoles(): Promise<UsuarioRole[]>;
}
