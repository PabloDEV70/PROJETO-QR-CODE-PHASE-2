/**
 * Dados de entrada do caso de uso ExportarJSON.
 *
 * @module Dicionario
 */
export interface ExportarJSONInput {
  /**
   * Token JWT do usuário autenticado.
   */
  tokenUsuario: string;

  /**
   * Tipo de export.
   */
  tipo: 'tabela' | 'campo' | 'dicionario-completo';

  /**
   * Nome da tabela (quando tipo = 'tabela' ou 'campo').
   */
  nomeTabela?: string;

  /**
   * Nome do campo (quando tipo = 'campo').
   */
  nomeCampo?: string;

  /**
   * Incluir metadados adicionais.
   */
  incluirMetadados?: boolean;
}
