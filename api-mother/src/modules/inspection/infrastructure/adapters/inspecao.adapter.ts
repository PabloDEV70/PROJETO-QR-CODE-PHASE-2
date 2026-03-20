/**
 * Adapter: Inspecao
 *
 * Implementação dos provedores de inspeção do banco de dados.
 */
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  IProvedorTabelas,
  IProvedorRelacoes,
  IProvedorQuery,
  ResultadoListaTabelas,
  ResultadoRelacoes,
  ResultadoChavesPrimarias,
  EntradaQuery,
} from '../../application/ports';
import { Tabela, ColunaTabela, RelacaoTabela, ChavePrimaria, ResultadoQuery } from '../../domain/entities';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { StructuredLogger } from '../../../../common/logging/structured-logger.service';
import { validateSqlQuery } from '../../../../database/sql-security';
import { SqlValidationService } from '../../../../security/sql-validation.service';
import { AuditService } from '../../../../security/audit.service';
import { DatabaseContextService } from '../../../../database/database-context.service';

@Injectable()
export class InspecaoAdapter implements IProvedorTabelas, IProvedorRelacoes, IProvedorQuery {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
    private readonly sqlValidationService: SqlValidationService,
    private readonly auditService: AuditService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  // ====================
  // IProvedorTabelas
  // ====================

  async listarTabelas(): Promise<ResultadoListaTabelas> {
    try {
      const query = `
        SELECT
          TABLE_NAME,
          TABLE_TYPE
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `;

      const result = await this.sqlServerService.executeSQL(query, []);
      const tabelas = result.map((row: Record<string, string>) =>
        Tabela.criar(row as { TABLE_NAME: string; TABLE_TYPE: string }),
      );

      this.logger.debug('Lista de tabelas obtida', { total: tabelas.length });

      return {
        tabelas,
        total: tabelas.length,
      };
    } catch (error) {
      this.logger.error('Falha ao listar tabelas', error as Error);
      throw new BadRequestException('Falha ao listar tabelas');
    }
  }

  async obterSchemaTabela(nomeTabela: string): Promise<ColunaTabela[]> {
    try {
      const query = `
        SELECT
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          ORDINAL_POSITION,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @param1
        ORDER BY ORDINAL_POSITION
      `;

      const result = await this.sqlServerService.executeSQL(query, [nomeTabela]);
      const colunas = result.map((row: Record<string, unknown>) =>
        ColunaTabela.criar({
          COLUMN_NAME: row.COLUMN_NAME as string,
          DATA_TYPE: row.DATA_TYPE as string,
          IS_NULLABLE: row.IS_NULLABLE as string,
          ORDINAL_POSITION: row.ORDINAL_POSITION as number,
          CHARACTER_MAXIMUM_LENGTH: row.CHARACTER_MAXIMUM_LENGTH as number | undefined,
          NUMERIC_PRECISION: row.NUMERIC_PRECISION as number | undefined,
          NUMERIC_SCALE: row.NUMERIC_SCALE as number | undefined,
        }),
      );

      this.logger.debug('Schema da tabela obtido', { nomeTabela, totalColunas: colunas.length });

      return colunas;
    } catch (error) {
      this.logger.error('Falha ao obter schema da tabela', error as Error, { nomeTabela });
      throw new BadRequestException('Falha ao obter schema da tabela');
    }
  }

  // ====================
  // IProvedorRelacoes
  // ====================

  async obterRelacoes(nomeTabela: string): Promise<ResultadoRelacoes> {
    try {
      const query = `
        SELECT
          fk.name AS ForeignKeyName,
          tp.name AS ParentTable,
          cp.name AS ParentColumn,
          tr.name AS ReferencedTable,
          cr.name AS ReferencedColumn,
          fk.delete_referential_action_desc AS DeleteAction,
          fk.update_referential_action_desc AS UpdateAction
        FROM
          sys.foreign_keys fk
          INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
          INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
          INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
          INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
          INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
        WHERE
          tp.name = @param1
        ORDER BY
          fk.name, fkc.constraint_column_id
      `;

      const result = await this.sqlServerService.executeSQL(query, [nomeTabela]);
      const relacoes = result.map((row: Record<string, string>) =>
        RelacaoTabela.criar({
          ForeignKeyName: row.ForeignKeyName,
          ParentTable: row.ParentTable,
          ParentColumn: row.ParentColumn,
          ReferencedTable: row.ReferencedTable,
          ReferencedColumn: row.ReferencedColumn,
          DeleteAction: row.DeleteAction,
          UpdateAction: row.UpdateAction,
        }),
      );

      this.logger.debug('Relações da tabela obtidas', { nomeTabela, totalRelacoes: relacoes.length });

      return {
        nomeTabela,
        relacoes,
        total: relacoes.length,
      };
    } catch (error) {
      this.logger.error('Falha ao obter relações da tabela', error as Error, { nomeTabela });
      // Retorna vazio em vez de erro - muitas tabelas não tem FKs
      return {
        nomeTabela,
        relacoes: [],
        total: 0,
      };
    }
  }

  async obterChavesPrimarias(nomeTabela: string): Promise<ResultadoChavesPrimarias> {
    try {
      const query = `
        SELECT
          kcu.TABLE_NAME,
          kcu.COLUMN_NAME,
          kcu.CONSTRAINT_NAME
        FROM
          INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        WHERE
          tc.TABLE_NAME = @param1
          AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ORDER BY
          kcu.TABLE_NAME,
          kcu.ORDINAL_POSITION
      `;

      const result = await this.sqlServerService.executeSQL(query, [nomeTabela]);
      const chaves = result.map((row: Record<string, string>) =>
        ChavePrimaria.criar({
          TABLE_NAME: row.TABLE_NAME,
          COLUMN_NAME: row.COLUMN_NAME,
          CONSTRAINT_NAME: row.CONSTRAINT_NAME,
        }),
      );

      this.logger.debug('Chaves primárias obtidas', { nomeTabela, totalChaves: chaves.length });

      return {
        nomeTabela,
        chaves,
        total: chaves.length,
      };
    } catch (error) {
      this.logger.error('Falha ao obter chaves primárias', error as Error, { nomeTabela });
      throw new BadRequestException('Falha ao obter chaves primárias');
    }
  }

  // ====================
  // IProvedorQuery
  // ====================

  async executarQuery(entrada: EntradaQuery): Promise<ResultadoQuery> {
    const inicio = Date.now();
    const database = this.databaseContext.getCurrentDatabase();
    let sucesso = false;
    let mensagemErro: string | undefined;

    try {
      const { query, params } = entrada;

      // Validação de segurança usando SqlValidationService
      const validationResult = this.sqlValidationService.validateSql(query);
      if (!validationResult.valid) {
        throw new ForbiddenException({
          message: validationResult.reason,
          code: 'SQL_VALIDATION_FAILED',
          blockedKeywords: validationResult.blockedKeywords,
        });
      }

      // Validação legada para compatibilidade
      validateSqlQuery(query);

      this.logger.debug('Executando query', {
        queryLength: query.length,
        paramCount: params.length,
        database,
      });

      const result = await this.sqlServerService.executeSQL(query, params);
      const tempoExecucao = Date.now() - inicio;

      sucesso = true;

      this.logger.info('Query executada com sucesso', {
        rowCount: result?.length || 0,
        database,
        tempoExecucao,
      });

      return ResultadoQuery.criar({
        query,
        params,
        data: result,
        rowCount: result?.length || 0,
        executionTime: tempoExecucao,
      });
    } catch (error: unknown) {
      sucesso = false;
      const err = error as Error & { response?: { error?: { message?: string } }; message?: string };
      mensagemErro = err?.message || 'Erro desconhecido';

      // Re-throw exceções de segurança
      if (error instanceof ForbiddenException) {
        this.logger.warn('Query bloqueada por segurança', {
          query: entrada.query,
          reason: err.message,
        });
        throw error;
      }

      this.logger.error('Falha na execução da query', error as Error, {
        query: entrada.query,
        paramCount: entrada.params.length,
      });

      const sqlError = err?.response?.error?.message || err?.message || 'Falha na execução da query';

      throw new BadRequestException({
        message: 'Erro na execução da query',
        sqlError: sqlError,
        details: err?.message,
      });
    } finally {
      // Audit logging para todas as execuções de query
      const duracao = Date.now() - inicio;
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: 'system', // TODO: Extrair do contexto da requisição
        ip: 'internal', // TODO: Extrair do contexto da requisição
        database,
        operation: 'QUERY',
        sql: entrada.query,
        success: sucesso,
        error: mensagemErro,
        duration: duracao,
      });
    }
  }
}
