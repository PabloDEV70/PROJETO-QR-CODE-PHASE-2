import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseContextService } from '../../../database/database-context.service';
import { SqlServerService } from '../../../database/sqlserver.service';
import { SankhyaPermissionValidatorService } from '../../permissoes/services/sankhya-permission-validator.service';
import { SankhyaPermissionService } from '../../permissoes/services/sankhya-permission.service';
import { DatabaseKey } from '../../../config/database.config';
import {
  McpDictionaryListDto,
  McpDictionaryTableDto,
  McpDictionaryFieldDto,
  McpDictionarySearchDto,
  McpDictionaryFieldSearchDto,
  McpDictionaryResponseDto,
  TableInfoDto,
  TableDetailDto,
  FieldInfoDto,
  FieldDetailDto,
  FieldOptionDto,
  FieldPropertyDto,
  InstanceInfoDto,
  RelationshipInfoDto,
  McpDictionaryToolDefinition,
} from '../dto/mcp-dictionary.dto';

@Injectable()
export class McpDictionaryService implements OnModuleInit {
  private readonly logger = new Logger(McpDictionaryService.name);

  private readonly defaultLimit: number;
  private readonly maxLimit: number;
  private readonly rateLimit: number;
  private readonly rateLimitWindow: number;

  private requestCounts = new Map<number, { count: number; resetTime: number }>();

  constructor(
    private readonly databaseContext: DatabaseContextService,
    private readonly sqlServerService: SqlServerService,
    private readonly configService: ConfigService,
    private readonly permissionValidator: SankhyaPermissionValidatorService,
    private readonly permissionService: SankhyaPermissionService,
  ) {
    this.defaultLimit = this.configService.get<number>('MCP_DICT_DEFAULT_LIMIT', 100);
    this.maxLimit = this.configService.get<number>('MCP_DICT_MAX_LIMIT', 500);
    this.rateLimit = this.configService.get<number>('MCP_DICT_RATE_LIMIT', 60);
    this.rateLimitWindow = 60000;
  }

  onModuleInit() {
    this.logger.log('MCP Sankhya Dictionary Service initialized');
    this.logger.log(`Default limit: ${this.defaultLimit}`);
    this.logger.log(`Max limit: ${this.maxLimit}`);
  }

  private getDatabaseFromRequest(request: any): DatabaseKey {
    const dbFromHeader = request?.headers?.['x-database'];
    if (dbFromHeader && ['TREINA', 'TESTE', 'PROD'].includes(String(dbFromHeader).toUpperCase())) {
      return String(dbFromHeader).toUpperCase() as DatabaseKey;
    }
    return 'TREINA';
  }

  getToolDefinitions(): McpDictionaryToolDefinition[] {
    return [
      {
        name: 'list_dictionary_tables',
        description:
          '📚 Lista todas as tabelas do dicionário de dados Sankhya que você tem acesso. Se você tem acesso à tela Dicionário de Dados, vê todas as tabelas. Caso contrário, vê apenas tabelas das telas permitidas. Ideal para explorar a estrutura do sistema.',
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
        name: 'get_table_details',
        description:
          '📋 Obtém informações detalhadas de uma tabela específica do dicionário. Retorna nome, descrição, tipo de numeração e código interno. Use para entender o propósito de cada tabela.',
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
        name: 'list_table_fields',
        description:
          '📝 Lista todos os campos (colunas) de uma tabela do dicionário. Retorna nome do campo, descrição, tipo de dados, tamanho e se permite pesquisa. Essencial para entender a estrutura dos dados.',
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
        name: 'get_field_details',
        description:
          '🔍 Obtém detalhes completos de um campo específico, incluindo todas as suas propriedades. Útil para entender regras de negócio e validações de um campo.',
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
        name: 'get_field_options',
        description:
          '📋 Lista todas as opções/valores possíveis de um campo (tipos enumerados). Por exemplo, lista todos os status possíveis para um campo de situação. Use para dropdowns e validações.',
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
        name: 'get_field_properties',
        description:
          '⚙️ Retorna as propriedades de interface de um campo: se é obrigatório, somente leitura, visível, editável. Use para entender como o campo se comporta na tela.',
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
        name: 'get_table_instances',
        description:
          '🏷️ Lista as instâncias (agrupamentos lógicos) de uma tabela. Cada tabela pode pertencer a uma ou mais instâncias que representam módulos ou funcionalidades do sistema.',
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
        name: 'get_table_relationships',
        description:
          '🔗 Retorna os relacionamentos (foreign keys) de uma tabela no dicionário de dados. Mostra como a tabela se conecta com outras tabelas do sistema Sankhya.',
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
        description:
          '🔍 Busca tabelas no dicionário por nome ou descrição. Use para encontrar tabelas relacionadas a um tema específico. Por exemplo: "PARCEIRO" encontra tabelas de parceiros.',
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
        name: 'search_fields',
        description:
          '🔍 Busca campos por nome ou descrição em todas as tabelas. Útil para descobrir em quais tabelas existe um determinado campo. Por exemplo: "CODPARC" encontra o campo em todas as tabelas.',
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

  async listTables(
    dto: McpDictionaryListDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<TableInfoDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const hasDictionaryAccess = await this.checkDictionaryAccess(codUsuario);
        const limit = Math.min(dto.limit || this.defaultLimit, this.maxLimit);

        let query: string;
        let params: any[];

        if (hasDictionaryAccess.hasAccess) {
          query = `
            SELECT TOP (@param1) NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
            FROM TDDTAB WITH (NOLOCK)
            ORDER BY NOMETAB
          `;
          params = [limit];
        } else {
          const userResult = (await this.permissionValidator['sqlServerService']?.executeSQL)
            ? await this.getUserGroup(codUsuario)
            : { CODGRUPO: -1 };
          const codGrupo = userResult?.CODGRUPO ?? -1;

          query = `
            SELECT DISTINCT TOP (@param4) T.NOMETAB, T.DESCRTAB, T.TIPONUMERACAO, T.NUCAMPONUMERACAO, T.ADICIONAL
            FROM TDDTAB T WITH (NOLOCK)
            WHERE EXISTS (
              SELECT 1 FROM TDDPER PER WITH (NOLOCK)
              INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
              WHERE INS.NOMETAB = T.NOMETAB
                AND PER.CODUSU IN (@param1, @param2, 0)
                AND PER.ACESSO != '0'
            )
            ORDER BY T.NOMETAB
          `;
          params = [codUsuario, codGrupo, 0, limit];
        }

        const result = await this.executeSQL(query, params);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getTableDetails(
    tableName: string,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<TableDetailDto>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const query = `
          SELECT NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
          FROM TDDTAB WITH (NOLOCK)
          WHERE NOMETAB = @param1
        `;

        const result = await this.executeSQL(query, [tableName.toUpperCase()]);

        if (result.length === 0) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Tabela ${tableName} não encontrada no dicionário`,
            },
            metadata: {
              executionTime: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              database,
            },
          };
        }

        return {
          success: true,
          data: result[0],
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async listTableFields(
    dto: McpDictionaryTableDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<FieldInfoDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const limit = Math.min(dto.limit || this.defaultLimit, this.maxLimit);

        const query = `
          SELECT TOP (@param2) NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO, 
                 TIPOAPRESENTACAO, TAMANHO, MASCARA, PERMITEPESQUISA, CALCULADO
          FROM TDDCAM WITH (NOLOCK)
          WHERE NOMETAB = @param1
          ORDER BY ORDEM
        `;

        const result = await this.executeSQL(query, [dto.tableName.toUpperCase(), limit]);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getFieldDetails(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<FieldDetailDto>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const query = `
          SELECT * FROM TDDCAM WITH (NOLOCK)
          WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
        `;

        const result = await this.executeSQL(query, [dto.tableName.toUpperCase(), dto.fieldName.toUpperCase()]);

        if (result.length === 0) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Campo ${dto.fieldName} não encontrado na tabela ${dto.tableName}`,
            },
            metadata: {
              executionTime: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              database,
            },
          };
        }

        return {
          success: true,
          data: result[0],
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getFieldOptions(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<FieldOptionDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const fieldQuery = `
          SELECT NUCAMPO FROM TDDCAM WITH (NOLOCK)
          WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
        `;
        const fieldResult = await this.executeSQL(fieldQuery, [
          dto.tableName.toUpperCase(),
          dto.fieldName.toUpperCase(),
        ]);

        if (fieldResult.length === 0) {
          return {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Campo não encontrado' },
            metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString(), database },
          };
        }

        const nucampo = fieldResult[0].NUCAMPO;

        const query = `
          SELECT NUCAMPO, CODOPC, DESCROPC, CODATU, VLRMAX
          FROM TDDOPC WITH (NOLOCK)
          WHERE NUCAMPO = @param1
          ORDER BY CODOPC
        `;

        const result = await this.executeSQL(query, [nucampo]);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getFieldProperties(
    dto: McpDictionaryFieldDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<FieldPropertyDto>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const query = `
          SELECT NUCAMPO, NOMETAB, NOMECAMPO,
                 REQUERIDO = CASE WHEN REQUERIDO = 'S' THEN 1 ELSE 0 END,
                 READONLY = CASE WHEN READONLY = 'S' THEN 1 ELSE 0 END,
                 VISIVEL = CASE WHEN VISIVEL = 'S' THEN 1 ELSE 0 END,
                 EDITAVEL = CASE WHEN EDITAVEL = 'S' THEN 1 ELSE 0 END,
                 VISIVELGRID = CASE WHEN VISIVELGRID = 'S' THEN 1 ELSE 0 END
          FROM TDDPCO WITH (NOLOCK)
          WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
        `;

        const result = await this.executeSQL(query, [dto.tableName.toUpperCase(), dto.fieldName.toUpperCase()]);

        if (result.length === 0) {
          return {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Propriedades não encontradas' },
            metadata: { executionTime: Date.now() - startTime, timestamp: new Date().toISOString(), database },
          };
        }

        return {
          success: true,
          data: result[0],
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getTableInstances(
    tableName: string,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<InstanceInfoDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const query = `
          SELECT NUINST, NOMEINST, DESCRINST
          FROM TDDINS WITH (NOLOCK)
          WHERE NOMETAB = @param1
          ORDER BY NOMEINST
        `;

        const result = await this.executeSQL(query, [tableName.toUpperCase()]);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async getTableRelationships(
    tableName: string,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<RelationshipInfoDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const query = `
          SELECT 
            L.NUINSTORIG, IO.NOMEINST AS NOMEINSTORIG, IO.DESCRINST AS DESCRINSTORIG,
            L.NUINSTDEST, ID.NOMEINST AS NOMEINSTDEST, ID.DESCRINST AS DESCRINSTDEST,
            L.TIPLIGACAO, L.NOMELIGACAO, L.EXPRESSAO, L.OBRIGATORIA, L.CONDICAO
          FROM TDDLIG L WITH (NOLOCK)
          INNER JOIN TDDINS IO WITH (NOLOCK) ON L.NUINSTORIG = IO.NUINST
          INNER JOIN TDDINS ID WITH (NOLOCK) ON L.NUINSTDEST = ID.NUINST
          WHERE IO.NOMETAB = @param1
          ORDER BY IO.NOMEINST, ID.NOMEINST
        `;

        const result = await this.executeSQL(query, [tableName.toUpperCase()]);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async searchTables(
    dto: McpDictionarySearchDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<TableInfoDto[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const limit = Math.min(dto.limit || this.defaultLimit, this.maxLimit);
        const term = `%${dto.term.toUpperCase()}%`;

        const hasDictionaryAccess = await this.checkDictionaryAccess(codUsuario);

        let query: string;
        let params: any[];

        if (hasDictionaryAccess.hasAccess) {
          query = `
            SELECT TOP (@param2) NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
            FROM TDDTAB WITH (NOLOCK)
            WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
            ORDER BY NOMETAB
          `;
          params = [term, limit];
        } else {
          const userResult = await this.getUserGroup(codUsuario);
          const codGrupo = userResult?.CODGRUPO ?? -1;

          query = `
            SELECT DISTINCT TOP (@param3) T.NOMETAB, T.DESCRTAB, T.TIPONUMERACAO, T.NUCAMPONUMERACAO, T.ADICIONAL
            FROM TDDTAB T WITH (NOLOCK)
            WHERE (T.NOMETAB LIKE @param1 OR T.DESCRTAB LIKE @param1)
              AND EXISTS (
                SELECT 1 FROM TDDPER PER WITH (NOLOCK)
                INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
                WHERE INS.NOMETAB = T.NOMETAB
                  AND PER.CODUSU IN (@param2, @param4, 0)
                  AND PER.ACESSO != '0'
              )
            ORDER BY T.NOMETAB
          `;
          params = [term, codUsuario, limit, codGrupo, 0];
        }

        const result = await this.executeSQL(query, params);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  async searchFields(
    dto: McpDictionaryFieldSearchDto,
    codUsuario: number,
    request: any,
  ): Promise<McpDictionaryResponseDto<any[]>> {
    const startTime = Date.now();
    const database = this.getDatabaseFromRequest(request);

    try {
      this.checkRateLimit(codUsuario);

      return this.databaseContext.run(database, async () => {
        const limit = Math.min(dto.limit || this.defaultLimit, this.maxLimit);
        const term = `%${dto.term}%`;

        const query = `
          SELECT DISTINCT TOP (@param2)
            C.NOMETAB, C.NOMECAMPO, C.DESCRCAMPO, C.TIPCAMPO, C.TAMANHO
          FROM TDDCAM C WITH (NOLOCK)
          WHERE C.NOMECAMPO LIKE @param1 OR C.DESCRCAMPO LIKE @param1
          ORDER BY C.NOMETAB, C.NOMECAMPO
        `;

        const result = await this.executeSQL(query, [term, limit]);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            database,
          },
        };
      });
    } catch (error: any) {
      return this.handleError(error, startTime, database);
    }
  }

  private async checkDictionaryAccess(codUsuario: number): Promise<{ hasAccess: boolean; source: string }> {
    return this.permissionService.checkResourceAccess(codUsuario, 'br.com.sankhya.core.cfg.DicionarioDados');
  }

  private async getUserGroup(codUsuario: number): Promise<{ CODGRUPO: number } | null> {
    try {
      const query = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
      const result = await this.executeSQL(query, [codUsuario]);
      return result[0] || null;
    } catch {
      return null;
    }
  }

  private async executeSQL(query: string, params: any[]): Promise<any[]> {
    return this.sqlServerService.executeSQL(query, params);
  }

  private checkRateLimit(codUsuario: number): void {
    const now = Date.now();
    const userData = this.requestCounts.get(codUsuario);

    if (!userData || now > userData.resetTime) {
      this.requestCounts.set(codUsuario, { count: 1, resetTime: now + this.rateLimitWindow });
      return;
    }

    if (userData.count >= this.rateLimit) {
      throw new Error(
        `Rate limit exceeded. Tente novamente em ${Math.ceil((userData.resetTime - now) / 1000)} segundos.`,
      );
    }

    userData.count++;
  }

  private handleError(error: any, startTime: number, database: string): McpDictionaryResponseDto {
    this.logger.error(`MCP Dictionary error: ${error.message}`, error.stack);

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Erro interno',
      },
      metadata: {
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        database,
      },
    };
  }
}
