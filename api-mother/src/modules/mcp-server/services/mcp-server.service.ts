import { Injectable, Logger, OnModuleInit, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SqlServerService } from '../../../database/sqlserver.service';
import { DatabaseContextService } from '../../../database/database-context.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { SqlAnalyzerService, AnalysisResult } from './sql-analyzer.service';
import { SankhyaPermissionValidatorService } from '../../permissoes/services/sankhya-permission-validator.service';
import { SankhyaPermissionService } from '../../permissoes/services/sankhya-permission.service';
import { McpDictionaryService } from '../../mcp-dictionary/services/mcp-dictionary.service';
import { DatabaseKey, DEFAULT_DATABASE_KEY } from '../../../config/database.config';
import {
  McpQueryDto,
  McpListTablesDto,
  McpTableSchemaDto,
  McpSearchTablesDto,
  McpSearchFieldsDto,
  McpResponseDto,
  QueryResultDto,
  TableInfoDto,
  TableSchemaDto,
  McpToolDefinition,
  McpDictionaryListDto,
  McpDictionaryTableDto,
  McpDictionaryFieldDto,
  McpDictionarySearchDto,
  McpDictionaryFieldSearchDto,
} from '../dto/mcp.dto';

@Injectable()
export class McpServerService implements OnModuleInit {
  private readonly logger = new Logger(McpServerService.name);

  private readonly queryTimeout: number;
  private readonly defaultLimit: number;
  private readonly maxLimit: number;
  private readonly rateLimit: number;
  private readonly rateLimitWindow: number;

  private requestCounts = new Map<number, { count: number; resetTime: number }>();

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly databaseContext: DatabaseContextService,
    private readonly configService: ConfigService,
    private readonly structuredLogger: StructuredLogger,
    private readonly sqlAnalyzer: SqlAnalyzerService,
    private readonly permissionValidator: SankhyaPermissionValidatorService,
    private readonly permissionService: SankhyaPermissionService,
    private readonly mcpDictionaryService: McpDictionaryService,
  ) {
    this.queryTimeout = this.configService.get<number>('MCP_QUERY_TIMEOUT', 30000);
    this.defaultLimit = this.configService.get<number>('MCP_DEFAULT_LIMIT', 100);
    this.maxLimit = this.configService.get<number>('MCP_MAX_LIMIT', 10000);
    this.rateLimit = this.configService.get<number>('MCP_RATE_LIMIT', 60);
    this.rateLimitWindow = 60000;
  }

  onModuleInit() {
    this.logger.log('MCP SQL Server Read-Only Service initialized');
    this.logger.log(`Query timeout: ${this.queryTimeout}ms`);
    this.logger.log(`Default limit: ${this.defaultLimit}`);
    this.logger.log(`Max limit: ${this.maxLimit}`);
    this.logger.log('Using TREINA database by default for safety');
  }

  private getDatabaseFromRequest(request: any): DatabaseKey {
    const dbFromHeader = request?.headers?.['x-database'];
    if (dbFromHeader && ['TREINA', 'TESTE', 'PROD'].includes(String(dbFromHeader).toUpperCase())) {
      return String(dbFromHeader).toUpperCase() as DatabaseKey;
    }
    return 'TREINA';
  }

  private getDatabaseKey(request: any): DatabaseKey {
    return this.getDatabaseFromRequest(request);
  }

  getToolDefinitions(): McpToolDefinition[] {
    return [
      {
        name: 'query_sql_server',
        description:
          'Executa uma query SQL SELECT no SQL Server Sankhya. Use sempre que precisar consultar dados. Retorna até 10000 registros por query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Query SQL (apenas SELECT). Use ? para parâmetros.',
              example: 'SELECT TOP 10 CODPARC, NOMEPARC FROM TGFPAR WHERE CODTIPPAR = ?',
            },
            params: {
              type: 'array',
              description: 'Parâmetros da query para evitar SQL injection',
              items: { type: 'any' },
              example: [1],
            },
            limit: {
              type: 'number',
              description: 'Limite de registros (padrão: 100, máximo: 10000)',
              minimum: 1,
              maximum: 10000,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_tables',
        description:
          'Lista todas as tabelas disponíveis no banco de dados Sankhya que o usuário tem permissão para acessar.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Limite de resultados (padrão: 100)',
              minimum: 1,
              maximum: 1000,
            },
            offset: {
              type: 'number',
              description: 'Offset para paginação',
              minimum: 0,
            },
          },
        },
      },
      {
        name: 'get_table_schema',
        description:
          'Retorna a estrutura/colunas de uma tabela específica, incluindo tipos de dados e se aceita nulos.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'search_tables',
        description: 'Busca tabelas por nome ou descrição no dicionário de dados Sankhya.',
        inputSchema: {
          type: 'object',
          properties: {
            term: {
              type: 'string',
              description: 'Termo de busca',
              example: 'PARCEIRO',
            },
            limit: {
              type: 'number',
              description: 'Limite de resultados (padrão: 100)',
            },
          },
          required: ['term'],
        },
      },
      {
        name: 'search_fields',
        description: 'Busca campos por nome ou descrição em todas as tabelas do dicionário.',
        inputSchema: {
          type: 'object',
          properties: {
            term: {
              type: 'string',
              description: 'Termo de busca',
              example: 'CODPARC',
            },
            limit: {
              type: 'number',
              description: 'Limite de resultados',
            },
          },
          required: ['term'],
        },
      },
      {
        name: 'get_table_relationships',
        description: 'Retorna os relacionamentos (foreign keys) de uma tabela específica.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'get_table_primary_keys',
        description: 'Retorna as chaves primárias de uma tabela específica.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'dictionary_list_tables',
        description:
          'Lista todas as tabelas do dicionário de dados Sankhya. Retorna nome, descrição e tipo de numeração.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Limite de tabelas (padrão: 100, máximo: 500)',
              minimum: 1,
              maximum: 500,
            },
            offset: {
              type: 'number',
              description: 'Offset para paginação',
              minimum: 0,
            },
          },
        },
      },
      {
        name: 'dictionary_get_table_details',
        description:
          'Obtém informações detalhadas de uma tabela específica do dicionário. Retorna nome, descrição, tipo de numeração e código interno.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome técnico da tabela (ex: TGFPAR, TCSPRO, TGFTOP)',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'dictionary_list_fields',
        description:
          'Lista todos os campos (colunas) de uma tabela do dicionário. Retorna nome do campo, descrição, tipo de dados, tamanho e se permite pesquisa.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
            limit: {
              type: 'number',
              description: 'Limite de campos (padrão: 500)',
            },
            offset: {
              type: 'number',
              description: 'Offset para paginação',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'dictionary_get_field_details',
        description:
          'Obtém detalhes completos de um campo específico, incluindo todas as suas propriedades. Útil para entender regras de negócio.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
            fieldName: {
              type: 'string',
              description: 'Nome do campo',
              example: 'CODPARC',
            },
          },
          required: ['tableName', 'fieldName'],
        },
      },
      {
        name: 'dictionary_get_field_options',
        description:
          'Lista todas as opções/valores possíveis de um campo (tipos enumerados). Por exemplo, lista todos os status possíveis.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
            fieldName: {
              type: 'string',
              description: 'Nome do campo',
              example: 'ATIVO',
            },
          },
          required: ['tableName', 'fieldName'],
        },
      },
      {
        name: 'dictionary_get_field_properties',
        description:
          'Retorna as propriedades de interface de um campo: se é obrigatório, somente leitura, visível, editável.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
            fieldName: {
              type: 'string',
              description: 'Nome do campo',
              example: 'CODPARC',
            },
          },
          required: ['tableName', 'fieldName'],
        },
      },
      {
        name: 'dictionary_get_table_instances',
        description:
          'Lista as instâncias (agrupamentos lógicos) de uma tabela. Cada tabela pode pertencer a uma ou mais instâncias.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'dictionary_get_table_relationships',
        description:
          'Retorna os relacionamentos (foreign keys) de uma tabela no dicionário de dados. Mostra como a tabela se conecta com outras.',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Nome da tabela',
              example: 'TGFPAR',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'dictionary_search_tables',
        description:
          'Busca tabelas no dicionário por nome ou descrição. Use para encontrar tabelas relacionadas a um tema específico.',
        inputSchema: {
          type: 'object',
          properties: {
            term: {
              type: 'string',
              description: 'Termo de busca',
              example: 'PARCEIRO',
            },
            limit: {
              type: 'number',
              description: 'Limite de resultados',
            },
          },
          required: ['term'],
        },
      },
      {
        name: 'dictionary_search_fields',
        description:
          'Busca campos por nome ou descrição em todas as tabelas. Útil para descobrir em quais tabelas existe um determinado campo.',
        inputSchema: {
          type: 'object',
          properties: {
            term: {
              type: 'string',
              description: 'Termo de busca',
              example: 'CODPARC',
            },
            limit: {
              type: 'number',
              description: 'Limite de resultados',
            },
          },
          required: ['term'],
        },
      },
    ];
  }

  async executeQuery(dto: McpQueryDto, codUsuario: number): Promise<McpResponseDto<QueryResultDto>> {
    const startTime = Date.now();
    const database = this.getDatabaseKey({} as Request);
    const source = 'api-dbexplorer.gigantao.net';

    try {
      this.checkRateLimit(codUsuario);

      if (!dto.query || typeof dto.query !== 'string') {
        this.structuredLogger.warn('Invalid query received', { codUsuario, database });
        return {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Query é obrigatória e deve ser uma string',
            source,
          },
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            source,
          },
        };
      }

      const limit = Math.min(dto.limit || this.defaultLimit, this.maxLimit);
      const queryWithLimit = this.addLimitToQuery(dto.query, limit);

      const analysis = await this.sqlAnalyzer.analyzeQuery(dto.query, codUsuario);

      if (!analysis.isValid) {
        this.structuredLogger.warn('Permission denied', { codUsuario, table: analysis.tables.join(','), queryLength: dto.query.length });
        throw new ForbiddenException(analysis.blockedReason);
      }

      const { parsedQuery, values } = this.sqlAnalyzer.parseParameters(queryWithLimit, dto.params || []);

      const result = await this.sqlServerService.executeSQL(parsedQuery, values);

      const columns = result.length > 0 ? Object.keys(result[0]) : [];
      const rows = result.map((row) => Object.values(row));

      const executionTime = Date.now() - startTime;

      this.structuredLogger.debug('Query executed', { codUsuario: codUsuario, durationMs: executionTime, rowCount: rows.length, success: true, database: database, queryLength: dto.query.length });

      return {
        success: true,
        data: {
          columns,
          rows,
          rowCount: rows.length,
          executionTime,
        },
        metadata: {
          executionTime,
          rowsAffected: rows.length,
          timestamp: new Date().toISOString(),
          source,
        },
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      if (error instanceof ForbiddenException) {
        this.structuredLogger.warn('Query blocked', { codUsuario, database, reason: error.message });
        return {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
            source,
          },
          metadata: {
            executionTime,
            timestamp: new Date().toISOString(),
            source,
          },
        };
      }

      this.structuredLogger.debug('Query executed', { codUsuario: codUsuario, durationMs: executionTime, rowCount: 0, success: false, database: database, queryLength: dto.query.length });
      this.structuredLogger.error('Query error', error as Error, { codUsuario, database, query: dto.query });

      const sqlError = this.extractSqlError(error);

      return {
        success: false,
        error: {
          code: 'QUERY_ERROR',
          message: error.message || 'Erro desconhecido ao executar query',
          sqlMessage: sqlError.message,
          sqlCode: sqlError.code,
          sqlNumber: sqlError.number,
          source,
        },
        metadata: {
          executionTime,
          timestamp: new Date().toISOString(),
          source,
        },
      };
    }
  }

  private extractSqlError(error: any): { message: string; code: string | null; number: string | null } {
    return {
      message: error.message || error.originalError?.message || error.sqlMessage || 'Erro desconhecido',
      code: error.code || error.originalError?.code || null,
      number: error.number ? String(error.number) : error.originalError?.number || null,
    };
  }

  async listTables(dto: McpListTablesDto, codUsuario: number): Promise<McpResponseDto<TableInfoDto[]>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const hasDictionaryAccess = await this.checkDictionaryAccess(codUsuario);

      let tables: TableInfoDto[];

      if (hasDictionaryAccess.hasAccess) {
        const query = `
          SELECT TOP (@param1) 
            TABLE_NAME, TABLE_TYPE
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_NAME NOT LIKE 'ACT_%'
            AND TABLE_NAME NOT LIKE 'RAF_%'
          ORDER BY TABLE_NAME
        `;
        const result = await this.sqlServerService.executeSQL(query, [dto.limit || 1000]);
        tables = result.map((row) => ({
          TABLE_NAME: row.TABLE_NAME,
          TABLE_TYPE: row.TABLE_TYPE,
        }));
      } else {
        const permittedTables = await this.permissionValidator.obterTabelasPermitidas(codUsuario);
        tables = permittedTables.slice(dto.offset || 0, (dto.offset || 0) + (dto.limit || 1000)).map((tableName) => ({
          TABLE_NAME: tableName,
          TABLE_TYPE: 'BASE TABLE' as const,
        }));
      }

      return {
        success: true,
        data: tables,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(`Erro ao listar tabelas para usuário ${codUsuario}`, error.stack);
      return {
        success: false,
        error: {
          code: 'LIST_ERROR',
          message: error.message || 'Erro ao listar tabelas',
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async getTableSchema(dto: McpTableSchemaDto, codUsuario: number): Promise<McpResponseDto<TableSchemaDto>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const hasAccess = await this.checkTableAccess(dto.tableName, codUsuario);
      if (!hasAccess) {
        throw new ForbiddenException(`Você não tem permissão para acessar a tabela ${dto.tableName}`);
      }

      const columnsQuery = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          ORDINAL_POSITION,
          COLUMN_DEFAULT,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @param1
        ORDER BY ORDINAL_POSITION
      `;

      const pkQuery = `
        SELECT 
          kcu.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = @param1
          AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ORDER BY kcu.ORDINAL_POSITION
      `;

      const [columnsResult, pkResult] = await Promise.all([
        this.sqlServerService.executeSQL(columnsQuery, [dto.tableName]),
        this.sqlServerService.executeSQL(pkQuery, [dto.tableName]),
      ]);

      const columns = columnsResult.map((row) => ({
        COLUMN_NAME: row.COLUMN_NAME,
        DATA_TYPE: row.DATA_TYPE,
        IS_NULLABLE: row.IS_NULLABLE,
        ORDINAL_POSITION: row.ORDINAL_POSITION,
        COLUMN_DEFAULT: row.COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH: row.CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION: row.NUMERIC_PRECISION,
        NUMERIC_SCALE: row.NUMERIC_SCALE,
      }));

      const primaryKeys = pkResult.map((row) => row.COLUMN_NAME);

      return {
        success: true,
        data: {
          tableName: dto.tableName,
          columns,
          primaryKeys,
          totalColumns: columns.length,
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        return {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'SCHEMA_ERROR',
          message: error.message || 'Erro ao obter schema da tabela',
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async searchTables(dto: McpSearchTablesDto, codUsuario: number): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const hasDictionaryAccess = await this.checkDictionaryAccess(codUsuario);

      let query: string;
      let params: any[];

      if (hasDictionaryAccess.hasAccess) {
        query = `
          SELECT TOP (@param2) 
            NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO
          FROM TDDTAB WITH (NOLOCK)
          WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
          ORDER BY NOMETAB
        `;
        params = [`%${dto.term.toUpperCase()}%`, dto.limit || 100];
      } else {
        const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
        const userResult = await this.sqlServerService.executeSQL(userQuery, [codUsuario]);
        const codGrupo = userResult[0]?.CODGRUPO ?? -1;

        query = `
          SELECT DISTINCT TOP (@param3)
            T.NOMETAB, T.DESCRTAB, T.TIPONUMERACAO, T.NUCAMPONUMERACAO
          FROM TDDTAB T WITH (NOLOCK)
          WHERE (T.NOMETAB LIKE @param1 OR T.DESCRTAB LIKE @param1)
            AND EXISTS (
              SELECT 1
              FROM TDDPER PER WITH (NOLOCK)
              INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
              WHERE INS.NOMETAB = T.NOMETAB
                AND PER.CODUSU IN (@param2, @param4, 0)
                AND PER.ACESSO != '0'
            )
          ORDER BY T.NOMETAB
        `;
        params = [`%${dto.term.toUpperCase()}%`, codUsuario, dto.limit || 100, codGrupo, 0];
      }

      const result = await this.sqlServerService.executeSQL(query, params);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message || 'Erro ao buscar tabelas',
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async searchFields(dto: McpSearchFieldsDto, codUsuario: number): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const query = `
        SELECT DISTINCT TOP (@param2)
          C.NOMETAB,
          C.NOMECAMPO,
          C.DESCRCAMPO,
          C.TIPCAMPO,
          C.TAMANHO
        FROM TDDCAM C WITH (NOLOCK)
        WHERE C.NOMECAMPO LIKE @param1 OR C.DESCRCAMPO LIKE @param1
        ORDER BY C.NOMETAB, C.NOMECAMPO
      `;

      const result = await this.sqlServerService.executeSQL(query, [`%${dto.term}%`, dto.limit || 100]);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message || 'Erro ao buscar campos',
        },
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async getTableRelationships(tableName: string, codUsuario: number): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const hasAccess = await this.checkTableAccess(tableName, codUsuario);
      if (!hasAccess) {
        throw new ForbiddenException(`Você não tem permissão para acessar a tabela ${tableName}`);
      }

      const query = `
        SELECT 
          fk.name AS ForeignKeyName,
          OBJECT_NAME(fk.parent_object_id) AS ParentTable,
          pc.name AS ParentColumn,
          OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
          rc.name AS ReferencedColumn,
          fk.delete_referential_action_desc AS DeleteAction,
          fk.update_referential_action_desc AS UpdateAction
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.columns pc ON fkc.parent_object_id = pc.object_id AND fkc.parent_column_id = pc.column_id
        INNER JOIN sys.columns rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
        WHERE OBJECT_NAME(fk.parent_object_id) = @param1
        ORDER BY fk.name
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName]);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: error.message },
          metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
        };
      }
      return {
        success: false,
        error: { code: 'RELATIONS_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async getTablePrimaryKeys(tableName: string, codUsuario: number): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();

    try {
      this.checkRateLimit(codUsuario);

      const hasAccess = await this.checkTableAccess(tableName, codUsuario);
      if (!hasAccess) {
        throw new ForbiddenException(`Você não tem permissão para acessar a tabela ${tableName}`);
      }

      const query = `
        SELECT 
          kcu.TABLE_NAME,
          kcu.COLUMN_NAME,
          kcu.CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = @param1
          AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ORDER BY kcu.ORDINAL_POSITION
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName]);

      return {
        success: true,
        data: result,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: error.message },
          metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
        };
      }
      return {
        success: false,
        error: { code: 'PK_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryListTables(
    dto: McpDictionaryListDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.listTables(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetTableDetails(tableName: string, codUsuario: number, request: any): Promise<McpResponseDto<any>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getTableDetails(tableName, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryListFields(
    dto: McpDictionaryTableDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.listTableFields(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetFieldDetails(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getFieldDetails(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetFieldOptions(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getFieldOptions(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetFieldProperties(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getFieldProperties(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetTableInstances(
    tableName: string,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getTableInstances(tableName, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionaryGetTableRelationships(
    tableName: string,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.getTableRelationships(tableName, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionarySearchTables(
    dto: McpDictionarySearchDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.searchTables(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  async dictionarySearchFields(
    dto: McpDictionaryFieldSearchDto,
    codUsuario: number,
    request: any,
  ): Promise<McpResponseDto<any[]>> {
    const startTime = Date.now();
    try {
      this.checkRateLimit(codUsuario);
      const result = await this.mcpDictionaryService.searchFields(dto, codUsuario, request);
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        metadata: {
          executionTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: { code: 'DICT_ERROR', message: error.message },
        metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      };
    }
  }

  private addLimitToQuery(query: string, limit: number): string {
    const normalized = query.trim();

    if (normalized.toUpperCase().startsWith('SELECT TOP')) {
      return normalized;
    }

    if (normalized.toUpperCase().startsWith('WITH')) {
      const lastSelectMatch = normalized.lastIndexOf('SELECT');
      if (lastSelectMatch !== -1) {
        const beforeSelect = normalized.substring(0, lastSelectMatch);
        const afterSelect = normalized.substring(lastSelectMatch + 7);
        if (!afterSelect.toUpperCase().startsWith('TOP')) {
          return `${beforeSelect}SELECT TOP (${limit}) ${afterSelect}`;
        }
      }
      return normalized;
    }

    if (normalized.toUpperCase().startsWith('SELECT')) {
      return `SELECT TOP (${limit}) ${normalized.substring(7)}`;
    }

    return normalized;
  }

  private async checkDictionaryAccess(codUsuario: number): Promise<{ hasAccess: boolean; source: string }> {
    return this.permissionService.checkResourceAccess(codUsuario, 'br.com.sankhya.core.cfg.DicionarioDados');
  }

  private async checkTableAccess(tableName: string, codUsuario: number): Promise<boolean> {
    const hasDictionaryAccess = await this.checkDictionaryAccess(codUsuario);
    if (hasDictionaryAccess.hasAccess) {
      return true;
    }

    const permission = await this.permissionValidator.obterDetalhesPermissao(codUsuario, tableName.toUpperCase());
    return permission !== null;
  }

  private checkRateLimit(codUsuario: number): void {
    const now = Date.now();
    const userData = this.requestCounts.get(codUsuario);

    if (!userData || now > userData.resetTime) {
      this.requestCounts.set(codUsuario, {
        count: 1,
        resetTime: now + this.rateLimitWindow,
      });
      return;
    }

    if (userData.count >= this.rateLimit) {
      const waitTime = userData.resetTime - now;
      this.structuredLogger.warn('Rate limit exceeded', { codUsuario: codUsuario });
      throw new Error(`Rate limit exceeded. Tente novamente em ${Math.ceil(waitTime / 1000)} segundos.`);
    }

    userData.count++;
  }
}
