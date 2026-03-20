/**
 * Tipos de elementos do dicionário que podem ser pesquisados
 */
export type TipoElementoDicionario = 'tabela' | 'campo' | 'opcao';

/**
 * DTO de entrada para o caso de uso PesquisarDicionarioUseCase
 *
 * Contém os parâmetros necessários para pesquisar no dicionário de dados
 */
export interface PesquisarDicionarioInput {
  /**
   * Termo de busca (pesquisa parcial)
   */
  termo: string;

  /**
   * Token JWT do usuário autenticado
   */
  tokenUsuario: string;

  /**
   * Tipos de elementos a serem pesquisados (opcional)
   * Se não informado, pesquisa em todos os tipos
   */
  tipos?: TipoElementoDicionario[];
}
