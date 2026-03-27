import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { validateSqlQuery } from '../../../database/sql-security';
import { SqlValidationService } from '../../../security/sql-validation.service';
import { AuditService } from '../../../security/audit.service';
import { DatabaseContextService } from '../../../database/database-context.service';
import { SqlErrorAnalyzerService } from '../../../common/services/sql-error-analyzer.service';
import { InspectionCacheService } from '../infrastructure/adapters/inspection-cache.service';
import { injectRowLimit } from '../../../common/utils/inject-row-limit';

@Injectable()
export class InspectionService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
    private readonly sqlValidationService: SqlValidationService,
    private readonly auditService: AuditService,
    private readonly databaseContext: DatabaseContextService,
    private readonly sqlErrorAnalyzer: SqlErrorAnalyzerService,
    private readonly cache: InspectionCacheService,
  ) {}

  async getTableSchema(tableName: string): Promise<any> {
    const database = this.databaseContext.getCurrentDatabase();
    const cacheKey = this.cache.schemaKey(database, tableName);
    const cached = this.cache.get<any>(cacheKey, 'schema');
    if (cached) {
      this.logger.debug('getTableSchema: cache hit', { database, tableName });
      return cached;
    }
    try {
      const query = `
        SELECT
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @param1
        ORDER BY ORDINAL_POSITION
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName]);
      this.logger.debug('Table schema retrieved', { tableName, columnCount: result.length });
      this.cache.set(cacheKey, result, this.cache.schemaTtl);
      return result;
    } catch (error) {
      this.logger.error('Failed to get table schema', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table schema');
    }
  }

  async getTables(): Promise<any> {
    const database = this.databaseContext.getCurrentDatabase();
    const cacheKey = this.cache.tableListKey(database);
    const cached = this.cache.get<any>(cacheKey, 'table_list');
    if (cached) {
      this.logger.debug('getTables: cache hit', { database });
      return cached;
    }
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
      this.logger.debug('Tables list retrieved', { tableCount: result.length });
      const payload = { tables: result, totalTables: result.length };
      this.cache.set(cacheKey, payload, this.cache.listTtl);
      return payload;
    } catch (error) {
      this.logger.error('Failed to get tables list', error as Error);
      throw new BadRequestException('Failed to retrieve tables list');
    }
  }

  async getTableRelations(tableName: string): Promise<any> {
    const database = this.databaseContext.getCurrentDatabase();
    const cacheKey = this.cache.relationsKey(database, tableName);
    const cached = this.cache.get<any>(cacheKey, 'relations');
    if (cached) {
      this.logger.debug('getTableRelations: cache hit', { database, tableName });
      return cached;
    }
    try {
      // Query correta para SQL Server - busca FKs da tabela
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

      const result = await this.sqlServerService.executeSQL(query, [tableName]);
      this.logger.debug('Table relations retrieved', {
        tableName,
        relationCount: result.length,
      });
      const payload = { tableName, relations: result, totalRelations: result.length };
      this.cache.set(cacheKey, payload, this.cache.schemaTtl);
      return payload;
    } catch (error) {
      this.logger.error('Failed to get table relations', error as Error, { tableName });
      // Retorna array vazio em vez de erro - muitas tabelas não tem FKs
      return { tableName, relations: [], totalRelations: 0 };
    }
  }

  async getPrimaryKeys(tableName: string): Promise<any> {
    const database = this.databaseContext.getCurrentDatabase();
    const cacheKey = this.cache.primaryKeysKey(database, tableName);
    const cached = this.cache.get<any>(cacheKey, 'primary_keys');
    if (cached) {
      this.logger.debug('getPrimaryKeys: cache hit', { database, tableName });
      return cached;
    }
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

      const result = await this.sqlServerService.executeSQL(query, [tableName]);
      this.logger.debug('Primary keys retrieved', { tableName, keyCount: result.length });
      const payload = { tableName, primaryKeys: result, totalPrimaryKeys: result.length };
      this.cache.set(cacheKey, payload, this.cache.schemaTtl);
      return payload;
    } catch (error) {
      this.logger.error('Failed to get primary keys', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve primary keys');
    }
  }

  async executeQuery(queryDto: { query: string; params: any[]; maxRows?: number }): Promise<any> {
    const startTime = Date.now();
    const database = this.databaseContext.getCurrentDatabase();
    let success = false;
    let errorMessage: string | undefined;

    try {
      const query = injectRowLimit(queryDto.query, queryDto.maxRows ?? 5000);
      const params = queryDto.params;

      // NEW: Enhanced SQL validation using SqlValidationService
      const validationResult = this.sqlValidationService.validateSql(query);
      if (!validationResult.valid) {
        throw new ForbiddenException({
          message: validationResult.reason,
          code: 'SQL_VALIDATION_FAILED',
          blockedKeywords: validationResult.blockedKeywords,
        });
      }

      // LEGACY: Keep existing validation for backwards compatibility
      validateSqlQuery(query);

      this.logger.debug('Executing custom query', {
        queryLength: query.length,
        paramCount: params.length,
        database,
      });

      const result = await this.sqlServerService.executeSQL(query, params);

      success = true;

      this.logger.debug('Query executed', { durationMs: Date.now() - startTime, rowCount: result?.length || 0, success: true, database, queryLength: query.length });

      this.logger.info('Query executed successfully', {
        rowCount: result?.length || 0,
        database,
      });

      return {
        query,
        params,
        data: result,
        rowCount: result?.length || 0,
      };
    } catch (error: any) {
      success = false;
      errorMessage = error?.message || 'Unknown error';

      // Re-throw security exceptions
      if (error instanceof ForbiddenException) {
        this.logger.warn('Permission denied', { codUsuario: 0, table: 'unknown', queryLength: queryDto.query.length });
        this.logger.warn('Query blocked by security', {
          query: queryDto.query,
          reason: error.message,
        });
        throw error;
      }

      this.logger.error('Query execution failed', error as Error, {
        query: queryDto.query,
        database,
      });

      // Análise detalhada do erro SQL
      const errorAnalysis = this.sqlErrorAnalyzer.analyzeError(error, queryDto.query);
      this.sqlErrorAnalyzer.generateFriendlyErrorResponse(errorAnalysis, queryDto.query);

      throw new BadRequestException({
        success: false,
        erro: {
          tipo: errorAnalysis.tipo,
          mensagem: errorAnalysis.mensagem,
          categoria: errorAnalysis.categoria,
        },
        queryComErro: queryDto.query,
        sugestoesCorrecao: errorAnalysis.sugestoes,
        exemploCorreto: errorAnalysis.exemploCorreto || null,
        sqlErrorOriginal: error?.response?.error?.message || error?.message || 'Query execution failed',
        detalhesTecnicos: error?.response || error?.message || null,
        ajuda:
          'Analise as sugestões acima para corrigir sua query. Se o problema persistir, verifique a documentação do Sankhya DB ou consulte o dicionário de dados.',
        documentacao: 'Use GET /inspection/tables para listar tabelas disponíveis',
      });
    } finally {
      // NEW: Audit logging for all query executions
      const duration = Date.now() - startTime;
      await this.auditService.logOperation({
        timestamp: new Date().toISOString(),
        user: 'system', // TODO: Extract from request context
        ip: 'internal', // TODO: Extract from request context
        database,
        operation: 'QUERY',
        sql: queryDto.query,
        success,
        error: errorMessage,
        duration,
      });
    }
  }
}
