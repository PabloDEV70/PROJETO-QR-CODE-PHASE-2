import { Injectable, Inject, Logger } from '@nestjs/common';
import { RequisicaoQuery, ResultadoQuery } from '../../../domain/entities';
import { QueryExecutorPort } from '../../ports';

export interface ExecutarQueryInput {
  query: string;
  database?: string;
}

/**
 * Caso de uso para execução de queries SQL SELECT
 */
@Injectable()
export class ExecutarQueryUseCase {
  private readonly logger = new Logger(ExecutarQueryUseCase.name);

  constructor(
    @Inject('QueryExecutorPort')
    private readonly queryExecutor: QueryExecutorPort,
  ) {}

  async executar(input: ExecutarQueryInput): Promise<ResultadoQuery> {
    this.logger.log(`Executando query no database: ${input.database || 'default'}`);
    this.logger.debug(`Query: ${input.query.substring(0, 100)}...`);

    try {
      // Criar entidade de requisição (valida automaticamente)
      const requisicao = new RequisicaoQuery(input.query, input.database);

      // Executar query através do port
      const inicioExecucao = Date.now();
      const resultado = await this.queryExecutor.executarQuery(requisicao);
      const tempoTotal = Date.now() - inicioExecucao;

      this.logger.log(`Query executada com sucesso: ${resultado.obterQuantidadeLinhas()} linhas em ${tempoTotal}ms`);

      return resultado;
    } catch (erro) {
      this.logger.error(`Erro ao executar query: ${erro.message}`, erro.stack);
      throw erro;
    }
  }
}
