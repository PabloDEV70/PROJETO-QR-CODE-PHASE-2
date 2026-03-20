import { RequisicaoQuery, ResultadoQuery } from '../../domain/entities';

/**
 * Port para execução de queries SQL
 */
export interface QueryExecutorPort {
  /**
   * Executa uma query SELECT
   * @param requisicao - Requisição contendo a query
   * @returns Resultado da execução
   * @throws Error se a query for inválida ou falhar
   */
  executarQuery(requisicao: RequisicaoQuery): Promise<ResultadoQuery>;

  /**
   * Valida se uma query é segura para execução
   * @param query - Query SQL a ser validada
   * @returns true se válida, lança erro se inválida
   */
  validarQuery(query: string): boolean;
}
