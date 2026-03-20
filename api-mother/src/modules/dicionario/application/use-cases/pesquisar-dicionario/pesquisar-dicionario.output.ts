import { TipoElementoDicionario } from './pesquisar-dicionario.input';

/**
 * DTO representando um resultado de pesquisa no dicionário
 */
export interface ResultadoPesquisaDto {
  /**
   * Tipo do elemento encontrado (tabela, campo ou opcao)
   */
  tipo: TipoElementoDicionario;

  /**
   * Nome da tabela (sempre presente)
   */
  nomeTabela: string;

  /**
   * Nome do campo (presente apenas para tipo 'campo')
   */
  nomeCampo?: string;

  /**
   * Descrição do elemento encontrado
   */
  descricao: string;

  /**
   * Texto que foi correspondido na busca
   */
  matchTexto: string;

  /**
   * Pontuação de relevância (quanto maior, mais relevante)
   */
  relevancia: number;
}

/**
 * DTO de saída para o caso de uso PesquisarDicionarioUseCase
 *
 * Contém a lista de resultados encontrados e metadados
 */
export interface PesquisarDicionarioOutput {
  /**
   * Lista de resultados da pesquisa
   */
  resultados: ResultadoPesquisaDto[];

  /**
   * Total de resultados encontrados
   */
  total: number;
}
