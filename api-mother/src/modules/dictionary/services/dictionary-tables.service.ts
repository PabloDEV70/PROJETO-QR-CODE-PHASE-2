import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { PaginationQueryDto } from '../dto/dictionary.dto';
import { SankhyaPermissionValidatorService } from '../../permissoes/services/sankhya-permission-validator.service';
import { SankhyaPermissionService } from '../../permissoes/services/sankhya-permission.service';

@Injectable()
export class DictionaryTablesService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
    private readonly permissionValidator: SankhyaPermissionValidatorService,
    private readonly permissionService: SankhyaPermissionService,
  ) {}

  async getTables(pagination: PaginationQueryDto, codUsuario?: number) {
    const limit = pagination?.limit ?? 10000;
    const offset = pagination?.offset ?? 0;

    this.logger.info('getTables called', { limit, offset, codUsuario });

    // Check if user has access to DicionarioDados screen
    const hasDictionaryAccess = codUsuario ? await this.checkDictionaryAccess(codUsuario) : false;

    let query: string;
    let params: any[];
    let countQuery: string;
    let countParams: any[];

    if (hasDictionaryAccess) {
      // User has access to Dictionary screen → show ALL tables
      this.logger.debug('User has dictionary access - showing all tables', { codUsuario });
      query = `
        SELECT TOP (@param1)
          NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
        FROM TDDTAB WITH (NOLOCK)
        ORDER BY NOMETAB
      `;
      params = [limit];

      countQuery = 'SELECT COUNT(*) AS total FROM TDDTAB WITH (NOLOCK)';
      countParams = [];
    } else {
      // User does NOT have dictionary access → filter by TDDINS permissions
      // Following Sankhya model: check permissions from user + group + global (0)
      this.logger.debug('User does not have dictionary access - filtering by permissions', {
        codUsuario,
      });

      // Get user's CODGRUPO first
      const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
      const userResult = await this.sqlServerService.executeSQL(userQuery, [codUsuario || 0]);
      const codGrupo = userResult[0]?.CODGRUPO ?? -1;

      query = `
        SELECT DISTINCT TOP (@param4)
          T.NOMETAB, T.DESCRTAB, T.TIPONUMERACAO, T.NUCAMPONUMERACAO, T.ADICIONAL
        FROM TDDTAB T WITH (NOLOCK)
        WHERE EXISTS (
          SELECT 1
          FROM TDDPER PER WITH (NOLOCK)
          INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
          WHERE INS.NOMETAB = T.NOMETAB
            AND PER.CODUSU IN (@param1, @param2, 0)
            AND PER.ACESSO != '0'
        )
        ORDER BY T.NOMETAB
      `;
      params = [codUsuario || 0, codGrupo, 0, limit];

      countQuery = `
        SELECT COUNT(DISTINCT T.NOMETAB) AS total
        FROM TDDTAB T WITH (NOLOCK)
        WHERE EXISTS (
          SELECT 1
          FROM TDDPER PER WITH (NOLOCK)
          INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
          WHERE INS.NOMETAB = T.NOMETAB
            AND PER.CODUSU IN (@param1, @param2, 0)
            AND PER.ACESSO != '0'
        )
      `;
      countParams = [codUsuario || 0, codGrupo, 0];
    }

    const result = await this.sqlServerService.executeSQL(query, params);
    const countResult = await this.sqlServerService.executeSQL(countQuery, countParams);

    const total = countResult[0]?.total || 0;

    this.logger.debug('Dictionary tables retrieved', {
      count: result.length,
      total,
      filtered: !hasDictionaryAccess,
    });
    return {
      data: result,
      pagination: { limit, offset, total },
    };
  }

  /**
   * Check if user has access to the Dictionary screen using centralized permission service
   *
   * Delegates to SankhyaPermissionService for consistent permission checking
   * across the entire application.
   */
  private async checkDictionaryAccess(codUsuario: number): Promise<boolean> {
    const result = await this.permissionService.checkResourceAccess(
      codUsuario,
      'br.com.sankhya.core.cfg.DicionarioDados',
    );

    this.logger.debug('Dictionary access check (via centralized service)', {
      codUsuario,
      hasAccess: result.hasAccess,
      source: result.source,
      reason: result.reason,
    });

    return result.hasAccess;
  }

  async getTableByName(tableName: string) {
    try {
      const query = `
        SELECT NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
        FROM TDDTAB WITH (NOLOCK)
        WHERE NOMETAB = @param1
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase()]);

      if (result.length === 0) {
        throw new BadRequestException(`Table ${tableName} not found in dictionary`);
      }

      this.logger.debug('Table info retrieved', { tableName });
      return result[0];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to get table info', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table info');
    }
  }

  async searchTables(term: string, pagination: PaginationQueryDto, codUsuario?: number) {
    const limit = pagination?.limit ?? 10000;
    const offset = pagination?.offset ?? 0;
    const searchTerm = `%${term.toUpperCase()}%`;

    this.logger.info('searchTables called', { term, limit, offset, codUsuario });

    // Check if user has access to DicionarioDados screen
    const hasDictionaryAccess = codUsuario ? await this.checkDictionaryAccess(codUsuario) : false;

    let query: string;
    let params: any[];
    let countQuery: string;
    let countParams: any[];

    if (hasDictionaryAccess) {
      // User has access to Dictionary screen → search ALL tables
      this.logger.debug('User has dictionary access - searching all tables', { codUsuario });
      query = `
        SELECT TOP (@param2)
          NOMETAB, DESCRTAB, TIPONUMERACAO, NUCAMPONUMERACAO, ADICIONAL
        FROM TDDTAB WITH (NOLOCK)
        WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
        ORDER BY NOMETAB
      `;
      params = [searchTerm, limit];

      countQuery = `
        SELECT COUNT(*) AS total FROM TDDTAB WITH (NOLOCK)
        WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
      `;
      countParams = [searchTerm];
    } else {
      // User does NOT have dictionary access → filter by TDDINS permissions
      // Following Sankhya model: check permissions from user + group + global (0)
      this.logger.debug('User does not have dictionary access - searching with filter', {
        codUsuario,
      });

      // Get user's CODGRUPO first
      const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
      const userResult = await this.sqlServerService.executeSQL(userQuery, [codUsuario || 0]);
      const codGrupo = userResult[0]?.CODGRUPO ?? -1;

      query = `
        SELECT DISTINCT TOP (@param5)
          T.NOMETAB, T.DESCRTAB, T.TIPONUMERACAO, T.NUCAMPONUMERACAO, T.ADICIONAL
        FROM TDDTAB T WITH (NOLOCK)
        WHERE (T.NOMETAB LIKE @param1 OR T.DESCRTAB LIKE @param1)
          AND EXISTS (
            SELECT 1
            FROM TDDPER PER WITH (NOLOCK)
            INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
            WHERE INS.NOMETAB = T.NOMETAB
              AND PER.CODUSU IN (@param2, @param3, 0)
              AND PER.ACESSO != '0'
          )
        ORDER BY T.NOMETAB
      `;
      params = [searchTerm, codUsuario || 0, codGrupo, 0, limit];

      countQuery = `
        SELECT COUNT(DISTINCT T.NOMETAB) AS total
        FROM TDDTAB T WITH (NOLOCK)
        WHERE (T.NOMETAB LIKE @param1 OR T.DESCRTAB LIKE @param1)
          AND EXISTS (
            SELECT 1
            FROM TDDPER PER WITH (NOLOCK)
            INNER JOIN TDDINS INS WITH (NOLOCK) ON PER.IDACESSO = INS.RESOURCEID
            WHERE INS.NOMETAB = T.NOMETAB
              AND PER.CODUSU IN (@param2, @param3, 0)
              AND PER.ACESSO != '0'
          )
      `;
      countParams = [searchTerm, codUsuario || 0, codGrupo, 0];
    }

    const result = await this.sqlServerService.executeSQL(query, params);
    const countResult = await this.sqlServerService.executeSQL(countQuery, countParams);

    const total = countResult[0]?.total || 0;

    this.logger.debug('Table search completed', {
      term,
      count: result.length,
      total,
      filtered: !hasDictionaryAccess,
    });
    return {
      data: result,
      searchTerm: term,
      pagination: { limit, offset, total },
    };
  }
}
