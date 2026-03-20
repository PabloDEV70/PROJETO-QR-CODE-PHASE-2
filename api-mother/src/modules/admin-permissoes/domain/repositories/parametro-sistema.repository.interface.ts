import { ParametroSistema } from '../entities/parametro-sistema.entity';

export const REPOSITORIO_PARAMETRO_SISTEMA = Symbol('IRepositorioParametroSistema');

/**
 * Interface do repositorio de Parametros do Sistema.
 */
export interface IRepositorioParametroSistema {
  /**
   * Busca todos os parametros.
   */
  buscarTodos(): Promise<ParametroSistema[]>;

  /**
   * Busca parametros ativos.
   */
  buscarAtivos(): Promise<ParametroSistema[]>;

  /**
   * Busca parametro por codigo.
   */
  buscarPorCodigo(codParametro: number): Promise<ParametroSistema | null>;

  /**
   * Busca parametro por chave.
   */
  buscarPorChave(chave: string): Promise<ParametroSistema | null>;

  /**
   * Cria um novo parametro.
   */
  criar(parametro: ParametroSistema): Promise<ParametroSistema>;

  /**
   * Atualiza um parametro existente.
   */
  atualizar(parametro: ParametroSistema): Promise<ParametroSistema>;

  /**
   * Remove um parametro (soft delete - desativa).
   */
  remover(codParametro: number): Promise<void>;

  /**
   * Verifica se existe parametro com a chave.
   */
  existeComChave(chave: string, excluirCodigo?: number): Promise<boolean>;
}
