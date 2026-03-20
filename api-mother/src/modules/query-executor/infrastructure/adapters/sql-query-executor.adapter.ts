import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { DatabaseContextService } from '../../../../database/database-context.service';
import { RequisicaoQuery, ResultadoQuery } from '../../domain/entities';
import { QueryExecutorPort } from '../../application/ports';
import { GatewayException } from '../../../../common/exceptions/gateway.exception';
import { GatewayErrorCode } from '../../../../common/enums/gateway-error-code.enum';

/**
 * Adapter para execução de queries SQL no SQL Server
 * Implementa segurança rigorosa: apenas SELECT queries
 */
@Injectable()
export class SqlQueryExecutorAdapter implements QueryExecutorPort {
  private readonly logger = new Logger(SqlQueryExecutorAdapter.name);

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  async executarQuery(requisicao: RequisicaoQuery): Promise<ResultadoQuery> {
    const query = requisicao.obterQueryLimpo();
    const database = requisicao.obterDatabase();

    this.logger.log(`Executando query no database: ${database || 'default'}`);

    // Validar novamente por segurança (defesa em profundidade)
    this.validarQuery(query);

    const inicioExecucao = Date.now();

    try {
      let resultado: any[];

      // Se database específico foi solicitado, usar contexto
      if (database) {
        resultado = await this.databaseContext.run(database as any, async () => {
          return await this.sqlServerService.executeSQL(query, []);
        });
      } else {
        resultado = await this.sqlServerService.executeSQL(query, []);
      }

      const tempoExecucao = Date.now() - inicioExecucao;

      // Extrair nomes das colunas se houver resultados
      const colunas = resultado && resultado.length > 0 ? Object.keys(resultado[0]) : undefined;

      this.logger.log(`Query executada: ${resultado.length} linhas em ${tempoExecucao}ms`);

      // Audit log para queries executadas
      this.registrarAuditoria({
        query: query.substring(0, 200), // Primeiros 200 chars
        database: database || this.databaseContext.getCurrentDatabase(),
        quantidadeLinhas: resultado.length,
        tempoExecucaoMs: tempoExecucao,
        timestamp: new Date().toISOString(),
      });

      return new ResultadoQuery(resultado, resultado.length, tempoExecucao, colunas);
    } catch (erro) {
      const tempoExecucao = Date.now() - inicioExecucao;

      this.logger.error(`Erro ao executar query: ${erro.message}`, erro.stack);

      // Audit log de erro
      this.registrarAuditoriaErro({
        query: query.substring(0, 200),
        database: database || this.databaseContext.getCurrentDatabase(),
        erro: erro.message,
        tempoExecucaoMs: tempoExecucao,
        timestamp: new Date().toISOString(),
      });

      throw new Error(`Erro ao executar query: ${erro.message}`);
    }
  }

  validarQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      throw new GatewayException(GatewayErrorCode.ERR_QUERY_EMPTY, 'Query cannot be empty', {}, HttpStatus.BAD_REQUEST);
    }

    const queryNormalizada = query.trim().toUpperCase();

    // APENAS SELECT permitido
    if (!queryNormalizada.startsWith('SELECT')) {
      this.logger.warn(`Tentativa de executar query não-SELECT bloqueada`);
      throw new GatewayException(
        GatewayErrorCode.ERR_QUERY_NOT_SELECT,
        'Only SELECT queries are permitted',
        {},
        HttpStatus.BAD_REQUEST,
      );
    }

    // Bloquear comandos perigosos
    const comandosProibidos = [
      'INSERT',
      'UPDATE',
      'DELETE',
      'DROP',
      'ALTER',
      'CREATE',
      'EXEC',
      'EXECUTE',
      'TRUNCATE',
      'GRANT',
      'REVOKE',
      'MERGE',
      'REPLACE',
      'CALL',
      'DECLARE',
      'SCRIPT',
      'SP_',
      'XP_',
    ];

    for (const comando of comandosProibidos) {
      const regex = new RegExp(`\\b${comando}\\b`, 'i');
      if (regex.test(query)) {
        this.logger.warn(`Tentativa de executar query com comando proibido bloqueada: ${comando}`);
        throw new GatewayException(
          GatewayErrorCode.ERR_QUERY_FORBIDDEN_COMMAND,
          `Command "${comando}" is not allowed`,
          { command: comando },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Validação contra SQL injection
    const padroesSuspeitos = [
      /;[\s]*DROP/i,
      /;[\s]*DELETE/i,
      /;[\s]*UPDATE/i,
      /;[\s]*INSERT/i,
      /UNION[\s]+SELECT/i,
      /--[\s]*$/,
      /\/\*/,
      /xp_/i,
      /sp_executesql/i,
      /waitfor[\s]+delay/i,
      /exec[\s]*\(/i,
    ];

    for (const padrao of padroesSuspeitos) {
      if (padrao.test(query)) {
        this.logger.warn(`Query contém padrão suspeito de SQL injection`);
        throw new GatewayException(
          GatewayErrorCode.ERR_QUERY_INJECTION_PATTERN,
          'Query contains suspicious SQL injection pattern',
          {},
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return true;
  }

  /**
   * Registra execução bem-sucedida de query para auditoria
   */
  private registrarAuditoria(info: {
    query: string;
    database: string;
    quantidadeLinhas: number;
    tempoExecucaoMs: number;
    timestamp: string;
  }): void {
    this.logger.log(
      `[AUDITORIA] Query executada | Database: ${info.database} | ` +
        `Linhas: ${info.quantidadeLinhas} | Tempo: ${info.tempoExecucaoMs}ms | ` +
        `Query: ${info.query}`,
    );
  }

  /**
   * Registra erro na execução de query para auditoria
   */
  private registrarAuditoriaErro(info: {
    query: string;
    database: string;
    erro: string;
    tempoExecucaoMs: number;
    timestamp: string;
  }): void {
    this.logger.error(
      `[AUDITORIA] Erro ao executar query | Database: ${info.database} | ` +
        `Erro: ${info.erro} | Tempo: ${info.tempoExecucaoMs}ms | ` +
        `Query: ${info.query}`,
    );
  }
}
