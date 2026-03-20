import { PermissaoEscrita } from '../entities/permissao-escrita.entity';
import { TipoOperacaoSigla } from '../value-objects/tipo-operacao.vo';

export const REPOSITORIO_PERMISSAO_ESCRITA = Symbol('IRepositorioPermissaoEscrita');

/**
 * Interface do repositório de permissões de escrita.
 * Define operações de consulta para permissões CRUD em tabelas.
 */
export interface IRepositorioPermissaoEscrita {
  /**
   * Busca todas as permissões de um usuário específico.
   * Inclui permissões diretas e via roles.
   */
  buscarPorUsuario(codUsuario: number): Promise<PermissaoEscrita[]>;

  /**
   * Busca permissões de um usuário para uma tabela específica.
   */
  buscarPorUsuarioETabela(codUsuario: number, tabela: string): Promise<PermissaoEscrita[]>;

  /**
   * Busca permissões de uma role específica.
   */
  buscarPorRole(roleId: number): Promise<PermissaoEscrita[]>;

  /**
   * Verifica se um usuário tem permissão para uma operação em uma tabela.
   * Considera permissões diretas, via roles e condições RLS.
   */
  verificarPermissao(codUsuario: number, tabela: string, operacao: TipoOperacaoSigla): Promise<boolean>;

  /**
   * Busca a permissão específica de um usuário para uma operação em uma tabela.
   * Retorna null se não encontrar.
   */
  buscarPermissaoEspecifica(
    codUsuario: number,
    tabela: string,
    operacao: TipoOperacaoSigla,
  ): Promise<PermissaoEscrita | null>;

  /**
   * Busca todas as permissões ativas para uma tabela.
   */
  buscarPorTabela(tabela: string): Promise<PermissaoEscrita[]>;
}
