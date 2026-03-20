import { PermissaoTabela, TipoOperacao } from '../entities/permissao-tabela.entity';

export const REPOSITORIO_PERMISSAO_TABELA = Symbol('IRepositorioPermissaoTabela');

/**
 * Interface do repositorio de Permissoes de Tabela.
 */
export interface IRepositorioPermissaoTabela {
  /**
   * Busca todas as permissoes.
   */
  buscarTodas(): Promise<PermissaoTabela[]>;

  /**
   * Busca permissoes por role.
   */
  buscarPorRole(codRole: number): Promise<PermissaoTabela[]>;

  /**
   * Busca permissoes por tabela.
   */
  buscarPorTabela(nomeTabela: string): Promise<PermissaoTabela[]>;

  /**
   * Busca permissao especifica.
   */
  buscarPorCodigo(codPermissao: number): Promise<PermissaoTabela | null>;

  /**
   * Busca permissao por role, tabela e operacao.
   */
  buscarPorRoleTabelaOperacao(
    codRole: number,
    nomeTabela: string,
    operacao: TipoOperacao,
  ): Promise<PermissaoTabela | null>;

  /**
   * Cria uma nova permissao.
   */
  criar(permissao: PermissaoTabela): Promise<PermissaoTabela>;

  /**
   * Atualiza uma permissao existente.
   */
  atualizar(permissao: PermissaoTabela): Promise<PermissaoTabela>;

  /**
   * Remove uma permissao.
   */
  remover(codPermissao: number): Promise<void>;

  /**
   * Verifica se existe permissao duplicada.
   */
  existePermissao(
    codRole: number,
    nomeTabela: string,
    operacao: TipoOperacao,
    excluirCodigo?: number,
  ): Promise<boolean>;
}
