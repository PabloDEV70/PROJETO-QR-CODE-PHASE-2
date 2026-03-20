/**
 * Dados de saída do caso de uso ExportarJSON.
 *
 * @module Dicionario
 */
export interface ExportarJSONOutput {
  /**
   * Dados exportados em JSON.
   */
  dados: any;

  /**
   * Tipo de export realizado.
   */
  tipo: string;

  /**
   * Timestamp do export.
   */
  exportadoEm: Date;

  /**
   * Metadados do export.
   */
  metadados?: {
    versao: string;
    total: number;
  };
}
