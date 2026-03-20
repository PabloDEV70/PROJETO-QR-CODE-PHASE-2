import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { DictionaryQueryDto } from '../dto/dictionary.dto';
import { DICTIONARY_TABLES } from '../constants/dictionary-tables.constant';

const DESTRUCTIVE_KEYWORDS = [
  'DROP',
  'TRUNCATE',
  'DELETE',
  'UPDATE',
  'INSERT',
  'ALTER',
  'CREATE',
  'EXEC',
  'EXECUTE',
  'GRANT',
  'REVOKE',
  'DENY',
];

@Injectable()
export class DictionaryQueryService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  async executeCustomQuery(queryDto: DictionaryQueryDto) {
    try {
      const { query, params } = queryDto;

      this.validateDictionaryQuery(query);

      this.logger.debug('Executing custom dictionary query', {
        queryLength: query.length,
        paramCount: params?.length || 0,
      });

      const result = await this.sqlServerService.executeSQL(query, params || []);
      const limitedResult = result.slice(0, 1000);

      this.logger.info('Custom dictionary query executed', {
        rowCount: result.length,
        limited: result.length > 1000,
      });

      return {
        query,
        params,
        data: limitedResult,
        rowCount: limitedResult.length,
        totalRows: result.length,
        limited: result.length > 1000,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        this.logger.warn('Dictionary query blocked', {
          query: queryDto.query,
          reason: error.message,
        });
        throw error;
      }

      this.logger.error('Custom dictionary query failed', error as Error, {
        query: queryDto.query,
      });
      throw new BadRequestException('Query execution failed');
    }
  }

  private validateDictionaryQuery(query: string): void {
    const normalizedQuery = query.toUpperCase().trim();

    this.validateIsSelect(normalizedQuery);
    this.validateNoDestructiveKeywords(normalizedQuery);
    this.validateOnlyDictionaryTables(normalizedQuery);
    this.validateNoComments(normalizedQuery);
    this.validateSingleStatement(query);
  }

  private validateIsSelect(normalizedQuery: string): void {
    if (!normalizedQuery.startsWith('SELECT')) {
      throw new ForbiddenException({
        message: 'Apenas queries SELECT sao permitidas',
        code: 'DICT_ONLY_SELECT',
      });
    }
  }

  private validateNoDestructiveKeywords(normalizedQuery: string): void {
    for (const keyword of DESTRUCTIVE_KEYWORDS) {
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(normalizedQuery)) {
        throw new ForbiddenException({
          message: `Operacao bloqueada: ${keyword} nao permitido`,
          code: 'DICT_DESTRUCTIVE_BLOCKED',
        });
      }
    }
  }

  private validateOnlyDictionaryTables(normalizedQuery: string): void {
    const fromMatches = normalizedQuery.match(/\bFROM\s+([A-Z0-9_]+)/gi) || [];
    const joinMatches = normalizedQuery.match(/\bJOIN\s+([A-Z0-9_]+)/gi) || [];

    const allTableRefs = [...fromMatches, ...joinMatches].map((match) => {
      const parts = match.split(/\s+/);
      return parts[1]?.toUpperCase();
    });

    for (const tableRef of allTableRefs) {
      if (tableRef && !DICTIONARY_TABLES.includes(tableRef)) {
        throw new ForbiddenException({
          message: `Tabela ${tableRef} nao permitida. Apenas: ${DICTIONARY_TABLES.join(', ')}`,
          code: 'DICT_TABLE_NOT_ALLOWED',
        });
      }
    }
  }

  private validateNoComments(normalizedQuery: string): void {
    if (normalizedQuery.includes('--') || normalizedQuery.includes('/*')) {
      throw new ForbiddenException({
        message: 'Comentarios SQL nao sao permitidos',
        code: 'DICT_COMMENTS_BLOCKED',
      });
    }
  }

  private validateSingleStatement(query: string): void {
    const withoutStrings = query.replace(/'[^']*'/g, '');
    if (withoutStrings.includes(';')) {
      throw new ForbiddenException({
        message: 'Multiplos statements nao sao permitidos',
        code: 'DICT_MULTI_STATEMENT_BLOCKED',
      });
    }
  }

  getDictionaryTablesList(): string[] {
    return DICTIONARY_TABLES;
  }
}
