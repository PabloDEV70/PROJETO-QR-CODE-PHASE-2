/**
 * Adapter: DatabaseExplorer
 *
 * Implementação dos provedores de exploração do banco de dados.
 * Usa conexão SA para leitura de objetos de sistema.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import * as mssql from 'mssql';
import {
  IProvedorResumoDatabase,
  IProvedorViews,
  IProvedorTriggers,
  IProvedorProcedures,
  IProvedorRelacionamentos,
  IProvedorCache,
  OpcoesPaginacao,
} from '../../application/ports';
import {
  ResumoDatabase,
  View,
  ViewDetalhe,
  Trigger,
  TriggerDetalhe,
  Procedure,
  ProcedureDetalhe,
  Relacionamento,
  EstatisticasCache,
} from '../../domain/entities';
import { SqlServerService } from '../../../../database/sqlserver.service';
import { StructuredLogger } from '../../../../common/logging/structured-logger.service';
import { DatabaseContextService } from '../../../../database/database-context.service';

@Injectable()
export class DatabaseExplorerAdapter
  implements
    IProvedorResumoDatabase,
    IProvedorViews,
    IProvedorTriggers,
    IProvedorProcedures,
    IProvedorRelacionamentos,
    IProvedorCache
{
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_DEFINITION_LENGTH = 500;
  private saPool: mssql.ConnectionPool | null = null;

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  // ====================
  // Métodos Auxiliares
  // ====================

  private getCacheKey(operation: string, params?: unknown): string {
    const database = this.databaseContext.getCurrentDatabase();
    return `${database}:${operation}:${JSON.stringify(params || {})}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.cacheHits++;
      return cached.data as T;
    }
    this.cacheMisses++;
    return null;
  }

  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });

    // Limpar entradas antigas se cache ficar muito grande
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.CACHE_TTL) {
          this.cache.delete(k);
        }
      }
    }
  }

  private truncateDefinition(definition: string | null, truncate: boolean): string | null {
    if (!definition) return null;
    if (truncate && definition.length > this.MAX_DEFINITION_LENGTH) {
      return definition.substring(0, this.MAX_DEFINITION_LENGTH) + '...';
    }
    return definition;
  }

  /**
   * Obtém conexão SA para leitura de objetos de sistema
   * CRÍTICO: Conexão configurada como READ-ONLY
   */
  private async getSaConnection(): Promise<mssql.ConnectionPool> {
    if (this.saPool?.connected) {
      return this.saPool;
    }

    const currentDb = this.databaseContext.getCurrentDatabase();
    const databaseName = currentDb === 'PROD' ? process.env.SQLSERVER_DATABASE : `SANKHYA_${currentDb}`;

    const config: mssql.config = {
      server: process.env.SQLSERVER_SERVER,
      port: parseInt(process.env.SQLSERVER_PORT || '1433'),
      database: databaseName,
      user: process.env.SQLSERVER_SA_USER,
      password: process.env.SQLSERVER_SA_PASSWORD,
      options: {
        encrypt: process.env.SQLSERVER_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQLSERVER_TRUST_SERVER_CERTIFICATE === 'true',
        readOnlyIntent: true, // CRÍTICO: Modo READ-ONLY
      },
      pool: {
        max: 2,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    this.saPool = new mssql.ConnectionPool(config);
    await this.saPool.connect();
    this.logger.info('Conexão SA criada (modo READ-ONLY)', { database: databaseName });
    return this.saPool;
  }

  // ====================
  // IProvedorResumoDatabase
  // ====================

  async obterResumo(): Promise<ResumoDatabase> {
    const cacheKey = this.getCacheKey('resumo');
    const cached = this.getCachedData<ResumoDatabase>(cacheKey);
    if (cached) {
      this.logger.debug('Retornando resumo do cache');
      return cached;
    }

    try {
      const query = `
        SELECT
          (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') as total_tables,
          (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) as total_views,
          (SELECT COUNT(*) FROM sys.triggers) as total_triggers,
          (SELECT COUNT(*) FROM sys.procedures) as total_procedures,
          (SELECT SUM(size * 8 / 1024.0) FROM sys.database_files) as total_size_mb,
          (SELECT SUM(CAST(FILEPROPERTY(name, 'SpaceUsed') AS BIGINT) * 8 / 1024.0) FROM sys.database_files WHERE type = 0) as data_size_mb,
          0 as index_size_mb,
          0 as unused_size_mb
      `;

      const result = await this.sqlServerService.executeSQL(query, []);
      const resumo = ResumoDatabase.criar({
        total_tables: result[0].total_tables || 0,
        total_views: result[0].total_views || 0,
        total_triggers: result[0].total_triggers || 0,
        total_procedures: result[0].total_procedures || 0,
        total_size_mb: result[0].total_size_mb || 0,
        data_size_mb: result[0].data_size_mb || 0,
        index_size_mb: result[0].index_size_mb || 0,
        unused_size_mb: result[0].unused_size_mb || 0,
      });

      this.setCachedData(cacheKey, resumo);
      this.logger.info('Resumo do banco obtido');
      return resumo;
    } catch (error) {
      this.logger.error('Falha ao obter resumo do banco', error as Error);
      throw new BadRequestException('Falha ao obter resumo do banco de dados');
    }
  }

  // ====================
  // IProvedorViews
  // ====================

  async listarViews(opcoes: OpcoesPaginacao): Promise<View[]> {
    const cacheKey = this.getCacheKey('views', opcoes);
    const cached = this.getCachedData<View[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { schema, limite = 100, offset = 0, truncar = false, incluirDefinicao = true } = opcoes;

      let sqlQuery = `
        SELECT
          TABLE_SCHEMA as schema_name,
          TABLE_NAME as view_name
          ${incluirDefinicao ? ', VIEW_DEFINITION as definition' : ''}
        FROM INFORMATION_SCHEMA.VIEWS
        WHERE 1=1
      `;

      const params: string[] = [];
      let paramIndex = 1;

      if (schema) {
        sqlQuery += ` AND TABLE_SCHEMA = @param${paramIndex}`;
        params.push(schema);
        paramIndex++;
      }

      sqlQuery += `
        ORDER BY TABLE_SCHEMA, TABLE_NAME
        OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
      `;

      const result = await this.sqlServerService.executeSQL(sqlQuery, params);

      const views = result.map((row: Record<string, unknown>) =>
        View.criar({
          schema_name: row.schema_name as string,
          view_name: row.view_name as string,
          definition: incluirDefinicao
            ? this.truncateDefinition(row.definition as string, truncar) || undefined
            : undefined,
        }),
      );

      this.setCachedData(cacheKey, views);
      this.logger.debug('Lista de views obtida', { count: views.length, schema });
      return views;
    } catch (error) {
      this.logger.error('Falha ao listar views', error as Error);
      throw new BadRequestException('Falha ao listar views');
    }
  }

  async obterDetalheView(schema: string, nome: string, truncar = false): Promise<ViewDetalhe> {
    const cacheKey = this.getCacheKey('view-detalhe', { schema, nome });
    const cached = this.getCachedData<ViewDetalhe>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Obter definição da view
      const viewQuery = `
        SELECT VIEW_DEFINITION as definition
        FROM INFORMATION_SCHEMA.VIEWS
        WHERE TABLE_SCHEMA = @param1 AND TABLE_NAME = @param2
      `;
      const viewResult = await this.sqlServerService.executeSQL(viewQuery, [schema, nome]);

      if (!viewResult.length) {
        throw new BadRequestException(`View ${schema}.${nome} não encontrada`);
      }

      // Obter colunas
      const columnsQuery = `
        SELECT
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as is_nullable,
          ORDINAL_POSITION as ordinal_position,
          CHARACTER_MAXIMUM_LENGTH as max_length,
          NUMERIC_PRECISION as precision,
          NUMERIC_SCALE as scale
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @param1 AND TABLE_NAME = @param2
        ORDER BY ORDINAL_POSITION
      `;
      const columnsResult = await this.sqlServerService.executeSQL(columnsQuery, [schema, nome]);

      const viewDetalhe = ViewDetalhe.criar({
        schema_name: schema,
        view_name: nome,
        definition: this.truncateDefinition(viewResult[0].definition, truncar) || undefined,
        columns: columnsResult.map((col: Record<string, unknown>) => ({
          column_name: col.column_name as string,
          data_type: col.data_type as string,
          is_nullable: Boolean(col.is_nullable),
          ordinal_position: col.ordinal_position as number,
          max_length: col.max_length as number | undefined,
          precision: col.precision as number | undefined,
          scale: col.scale as number | undefined,
        })),
      });

      this.setCachedData(cacheKey, viewDetalhe);
      this.logger.debug('Detalhe da view obtido', { schema, nome });
      return viewDetalhe;
    } catch (error) {
      this.logger.error('Falha ao obter detalhe da view', error as Error, { schema, nome });
      throw error instanceof BadRequestException ? error : new BadRequestException('Falha ao obter detalhe da view');
    }
  }

  // ====================
  // IProvedorTriggers
  // ====================

  async listarTriggers(opcoes: OpcoesPaginacao): Promise<Trigger[]> {
    const cacheKey = this.getCacheKey('triggers', opcoes);
    const cached = this.getCachedData<Trigger[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { schema, limite = 100, offset = 0, truncar = false, incluirDefinicao = true } = opcoes;

      let sqlQuery = `
        SELECT
          SCHEMA_NAME(o.schema_id) as schema_name,
          t.name as trigger_name,
          OBJECT_NAME(t.parent_id) as table_name,
          t.type_desc,
          t.is_disabled
          ${incluirDefinicao ? ', OBJECT_DEFINITION(t.object_id) as definition' : ''}
        FROM sys.triggers t
        INNER JOIN sys.objects o ON t.parent_id = o.object_id
        WHERE t.parent_class = 1
      `;

      const params: string[] = [];
      let paramIndex = 1;

      if (schema) {
        sqlQuery += ` AND SCHEMA_NAME(o.schema_id) = @param${paramIndex}`;
        params.push(schema);
        paramIndex++;
      }

      sqlQuery += `
        ORDER BY SCHEMA_NAME(o.schema_id), t.name
        OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
      `;

      // Usar conexão SA para ler objetos de sistema
      const pool = await this.getSaConnection();
      const request = pool.request();
      params.forEach((value, index) => {
        request.input(`param${index + 1}`, value);
      });
      const result = await request.query(sqlQuery);
      const rows = result.recordset;

      const triggers = rows.map((row: Record<string, unknown>) =>
        Trigger.criar({
          schema_name: row.schema_name as string,
          trigger_name: row.trigger_name as string,
          table_name: row.table_name as string,
          type_desc: row.type_desc as string,
          is_disabled: Boolean(row.is_disabled),
          definition: incluirDefinicao
            ? this.truncateDefinition(row.definition as string, truncar) || undefined
            : undefined,
        }),
      );

      this.setCachedData(cacheKey, triggers);
      this.logger.debug('Lista de triggers obtida', { count: triggers.length, schema });
      return triggers;
    } catch (error) {
      this.logger.error('Falha ao listar triggers', error as Error);
      throw new BadRequestException('Falha ao listar triggers');
    }
  }

  async obterDetalheTrigger(schema: string, nome: string, truncar = false): Promise<TriggerDetalhe> {
    const cacheKey = this.getCacheKey('trigger-detalhe', { schema, nome });
    const cached = this.getCachedData<TriggerDetalhe>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const pool = await this.getSaConnection();

      // Obter informações do trigger
      const triggerQuery = `
        SELECT
          t.name as trigger_name,
          OBJECT_NAME(t.parent_id) as table_name,
          t.type_desc,
          t.is_disabled,
          OBJECT_DEFINITION(t.object_id) as definition
        FROM sys.triggers t
        INNER JOIN sys.objects o ON t.parent_id = o.object_id
        WHERE SCHEMA_NAME(o.schema_id) = @param1 AND t.name = @param2
      `;
      const triggerRequest = pool.request();
      triggerRequest.input('param1', schema);
      triggerRequest.input('param2', nome);
      const triggerResult = await triggerRequest.query(triggerQuery);
      const triggerRows = triggerResult.recordset;

      if (!triggerRows.length) {
        throw new BadRequestException(`Trigger ${schema}.${nome} não encontrado`);
      }

      // Obter eventos do trigger
      const eventsQuery = `
        SELECT
          te.type_desc as event_type
        FROM sys.trigger_events te
        INNER JOIN sys.triggers t ON te.object_id = t.object_id
        INNER JOIN sys.objects o ON t.parent_id = o.object_id
        WHERE SCHEMA_NAME(o.schema_id) = @param1 AND t.name = @param2
      `;
      const eventsRequest = pool.request();
      eventsRequest.input('param1', schema);
      eventsRequest.input('param2', nome);
      const eventsResult = await eventsRequest.query(eventsQuery);
      const eventsRows = eventsResult.recordset;

      const triggerDetalhe = TriggerDetalhe.criar({
        schema_name: schema,
        trigger_name: nome,
        table_name: triggerRows[0].table_name,
        type_desc: triggerRows[0].type_desc,
        is_disabled: Boolean(triggerRows[0].is_disabled),
        definition: this.truncateDefinition(triggerRows[0].definition, truncar) || undefined,
        trigger_events: eventsRows.map((e: Record<string, unknown>) => e.event_type as string),
      });

      this.setCachedData(cacheKey, triggerDetalhe);
      this.logger.debug('Detalhe do trigger obtido', { schema, nome });
      return triggerDetalhe;
    } catch (error) {
      this.logger.error('Falha ao obter detalhe do trigger', error as Error, { schema, nome });
      throw error instanceof BadRequestException ? error : new BadRequestException('Falha ao obter detalhe do trigger');
    }
  }

  // ====================
  // IProvedorProcedures
  // ====================

  async listarProcedures(opcoes: OpcoesPaginacao): Promise<Procedure[]> {
    const cacheKey = this.getCacheKey('procedures', opcoes);
    const cached = this.getCachedData<Procedure[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { schema, limite = 100, offset = 0, truncar = false, incluirDefinicao = true } = opcoes;

      let sqlQuery = `
        SELECT
          SCHEMA_NAME(p.schema_id) as schema_name,
          p.name as procedure_name,
          p.type_desc,
          p.create_date as created_date,
          p.modify_date as modified_date
          ${incluirDefinicao ? ', OBJECT_DEFINITION(p.object_id) as definition' : ''}
        FROM sys.procedures p
        WHERE 1=1
      `;

      const params: string[] = [];
      let paramIndex = 1;

      if (schema) {
        sqlQuery += ` AND SCHEMA_NAME(p.schema_id) = @param${paramIndex}`;
        params.push(schema);
        paramIndex++;
      }

      sqlQuery += `
        ORDER BY SCHEMA_NAME(p.schema_id), p.name
        OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
      `;

      // Usar conexão SA para ler objetos de sistema
      const pool = await this.getSaConnection();
      const request = pool.request();
      params.forEach((value, index) => {
        request.input(`param${index + 1}`, value);
      });
      const result = await request.query(sqlQuery);
      const rows = result.recordset;

      const procedures = rows.map((row: Record<string, unknown>) =>
        Procedure.criar({
          schema_name: row.schema_name as string,
          procedure_name: row.procedure_name as string,
          type_desc: row.type_desc as string,
          created_date: row.created_date as Date,
          modified_date: row.modified_date as Date,
          definition: incluirDefinicao
            ? this.truncateDefinition(row.definition as string, truncar) || undefined
            : undefined,
        }),
      );

      this.setCachedData(cacheKey, procedures);
      this.logger.debug('Lista de procedures obtida', { count: procedures.length, schema });
      return procedures;
    } catch (error) {
      this.logger.error('Falha ao listar procedures', error as Error);
      throw new BadRequestException('Falha ao listar procedures');
    }
  }

  async obterDetalheProcedure(schema: string, nome: string, truncar = false): Promise<ProcedureDetalhe> {
    const cacheKey = this.getCacheKey('procedure-detalhe', { schema, nome });
    const cached = this.getCachedData<ProcedureDetalhe>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const pool = await this.getSaConnection();

      // Obter informações da procedure
      const procQuery = `
        SELECT
          p.type_desc,
          p.create_date as created_date,
          p.modify_date as modified_date,
          OBJECT_DEFINITION(p.object_id) as definition
        FROM sys.procedures p
        WHERE SCHEMA_NAME(p.schema_id) = @param1 AND p.name = @param2
      `;
      const procRequest = pool.request();
      procRequest.input('param1', schema);
      procRequest.input('param2', nome);
      const procResult = await procRequest.query(procQuery);
      const procRows = procResult.recordset;

      if (!procRows.length) {
        throw new BadRequestException(`Procedure ${schema}.${nome} não encontrada`);
      }

      // Obter parâmetros
      const paramsQuery = `
        SELECT
          p.name as parameter_name,
          TYPE_NAME(p.user_type_id) as data_type,
          p.max_length,
          p.precision,
          p.scale,
          p.is_output
        FROM sys.parameters p
        INNER JOIN sys.procedures pr ON p.object_id = pr.object_id
        WHERE SCHEMA_NAME(pr.schema_id) = @param1 AND pr.name = @param2
        ORDER BY p.parameter_id
      `;
      const paramsRequest = pool.request();
      paramsRequest.input('param1', schema);
      paramsRequest.input('param2', nome);
      const paramsResult = await paramsRequest.query(paramsQuery);
      const paramsRows = paramsResult.recordset;

      const procedureDetalhe = ProcedureDetalhe.criar({
        schema_name: schema,
        procedure_name: nome,
        type_desc: procRows[0].type_desc,
        created_date: procRows[0].created_date,
        modified_date: procRows[0].modified_date,
        definition: this.truncateDefinition(procRows[0].definition, truncar) || undefined,
        parameters: paramsRows.map((p: Record<string, unknown>) => ({
          parameter_name: p.parameter_name as string,
          data_type: p.data_type as string,
          max_length: p.max_length as number,
          precision: p.precision as number,
          scale: p.scale as number,
          is_output: Boolean(p.is_output),
        })),
      });

      this.setCachedData(cacheKey, procedureDetalhe);
      this.logger.debug('Detalhe da procedure obtido', { schema, nome });
      return procedureDetalhe;
    } catch (error) {
      this.logger.error('Falha ao obter detalhe da procedure', error as Error, { schema, nome });
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Falha ao obter detalhe da procedure');
    }
  }

  // ====================
  // IProvedorRelacionamentos
  // ====================

  async listarRelacionamentos(opcoes: OpcoesPaginacao): Promise<Relacionamento[]> {
    const cacheKey = this.getCacheKey('relacionamentos', opcoes);
    const cached = this.getCachedData<Relacionamento[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { schema, limite = 100, offset = 0 } = opcoes;

      let sqlQuery = `
        SELECT
          fk.name as constraint_name,
          SCHEMA_NAME(fk.schema_id) as parent_schema,
          OBJECT_NAME(fk.parent_object_id) as parent_table,
          COL_NAME(fkc.parent_object_id, fkc.parent_column_id) as parent_column,
          SCHEMA_NAME(pk.schema_id) as referenced_schema,
          OBJECT_NAME(fk.referenced_object_id) as referenced_table,
          COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) as referenced_column,
          fk.delete_referential_action_desc as delete_rule,
          fk.update_referential_action_desc as update_rule
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.objects pk ON fk.referenced_object_id = pk.object_id
        WHERE 1=1
      `;

      const params: string[] = [];
      let paramIndex = 1;

      if (schema) {
        sqlQuery += ` AND SCHEMA_NAME(fk.schema_id) = @param${paramIndex}`;
        params.push(schema);
        paramIndex++;
      }

      sqlQuery += `
        ORDER BY SCHEMA_NAME(fk.schema_id), OBJECT_NAME(fk.parent_object_id), fk.name
        OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
      `;

      const result = await this.sqlServerService.executeSQL(sqlQuery, params);

      const relacionamentos = result.map((row: Record<string, unknown>) =>
        Relacionamento.criar({
          constraint_name: row.constraint_name as string,
          parent_schema: row.parent_schema as string,
          parent_table: row.parent_table as string,
          parent_column: row.parent_column as string,
          referenced_schema: row.referenced_schema as string,
          referenced_table: row.referenced_table as string,
          referenced_column: row.referenced_column as string,
          delete_rule: row.delete_rule as string,
          update_rule: row.update_rule as string,
        }),
      );

      this.setCachedData(cacheKey, relacionamentos);
      this.logger.debug('Lista de relacionamentos obtida', { count: relacionamentos.length, schema });
      return relacionamentos;
    } catch (error) {
      this.logger.error('Falha ao listar relacionamentos', error as Error);
      throw new BadRequestException('Falha ao listar relacionamentos');
    }
  }

  // ====================
  // IProvedorCache
  // ====================

  async limparCache(): Promise<void> {
    const entriesCount = this.cache.size;
    this.cache.clear();
    this.logger.info('Cache limpo', { entriesCount });
  }

  async obterEstatisticasCache(): Promise<EstatisticasCache> {
    // Calcular tamanho aproximado do cache
    let tamanhoChaves = 0;
    let tamanhoValores = 0;

    for (const [key, value] of this.cache.entries()) {
      tamanhoChaves += key.length * 2; // UTF-16 em JavaScript
      tamanhoValores += JSON.stringify(value.data).length * 2;
    }

    return EstatisticasCache.criar({
      hits: this.cacheHits,
      misses: this.cacheMisses,
      keys: this.cache.size,
      ksize: tamanhoChaves,
      vsize: tamanhoValores,
    });
  }
}
