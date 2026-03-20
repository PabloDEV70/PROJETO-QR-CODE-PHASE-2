import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { SankhyaPermissionValidatorService } from '../../permissoes/services/sankhya-permission-validator.service';
import { SankhyaPermissionService } from '../../permissoes/services/sankhya-permission.service';

export interface AnalysisResult {
  isValid: boolean;
  operation: string;
  tables: string[];
  blockedReason?: string;
}

@Injectable()
export class SqlAnalyzerService {
  private readonly logger = new Logger(SqlAnalyzerService.name);

  private readonly BLOCKED_KEYWORDS = [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'TRUNCATE',
    'ALTER',
    'CREATE',
    'EXEC',
    'EXECUTE',
    'GRANT',
    'REVOKE',
    'LOCK',
    'UNLOCK',
    'KILL',
    'SHUTDOWN',
    'BACKUP',
    'RESTORE',
    'MERGE',
    'UPSERT',
    'REPLACE',
    'CALL',
    'BEGIN',
    'COMMIT',
    'ROLLBACK',
  ];

  private readonly ALLOWED_COMMENTS = ['--', '/*', '*/'];

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly permissionValidator: SankhyaPermissionValidatorService,
    private readonly permissionService: SankhyaPermissionService,
  ) {}

  async analyzeQuery(query: string, codUsuario: number): Promise<AnalysisResult> {
    const normalizedQuery = this.normalizeQuery(query);

    this.logger.debug(`Analisando query: ${normalizedQuery.substring(0, 100)}...`);

    const operation = this.extractOperation(normalizedQuery);
    const tables = this.extractTables(normalizedQuery);

    if (operation !== 'SELECT') {
      this.logger.warn(`Operação bloqueada: ${operation} para usuário ${codUsuario}`);
      return {
        isValid: false,
        operation,
        tables,
        blockedReason: `Operação ${operation} não permitida. Apenas SELECT é permitido em modo read-only.`,
      };
    }

    const hasBlockedKeywords = this.checkBlockedKeywords(normalizedQuery);
    if (hasBlockedKeywords) {
      this.logger.warn(`Keywords bloqueadas detectadas para usuário ${codUsuario}`);
      return {
        isValid: false,
        operation,
        tables,
        blockedReason: 'Query contém palavras-chave bloqueadas que não são permitidas em modo read-only.',
      };
    }

    const hasValidPermissions = await this.validateTablePermissions(tables, codUsuario);
    if (!hasValidPermissions) {
      return {
        isValid: false,
        operation,
        tables,
        blockedReason: 'Você não tem permissão para acessar uma ou mais tabelas nesta query.',
      };
    }

    this.logger.debug(`Query válida para usuário ${codUsuario}: ${tables.length} tabelas`);
    return {
      isValid: true,
      operation,
      tables,
    };
  }

  private normalizeQuery(query: string): string {
    return query.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  private extractOperation(query: string): string {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim().toUpperCase();

    if (normalizedQuery.startsWith('WITH')) {
      const afterWith = normalizedQuery.substring(5);
      const mainSelectMatch = afterWith.match(/\)\s*SELECT/i);
      if (mainSelectMatch) {
        return 'SELECT';
      }
    }

    const match = query.match(/^\s*(\w+)/);
    return match ? match[1] : 'UNKNOWN';
  }

  private extractTables(query: string): string[] {
    const tables = new Set<string>();

    let normalizedQuery = query;

    const withMatch = normalizedQuery.match(/WITH\s+/i);
    if (withMatch) {
      const afterWith = normalizedQuery.substring(withMatch.index + 6);
      const mainSelectMatch = afterWith.match(/\)\s*SELECT\s+/i);
      if (mainSelectMatch) {
        normalizedQuery = afterWith.substring(mainSelectMatch.index + mainSelectMatch[0].length - 1);
        if (!normalizedQuery.trim().toUpperCase().startsWith('SELECT')) {
          normalizedQuery = 'SELECT ' + normalizedQuery;
        }
      }
    }

    const fromMatch = normalizedQuery.match(/FROM\s+([\w\[\]`""]+(?:\s*,\s*[\w\[\]`""]+)*)/i);
    if (fromMatch) {
      const tablesStr = fromMatch[1];
      const tableNames = tablesStr.split(',').map((t) =>
        t
          .trim()
          .split(/\s+/)[0]
          .replace(/[[\]`"]/g, ''),
      );
      tableNames.forEach((t) => {
        if (t && t !== 'WITH' && t !== 'NOLOCK') {
          tables.add(t.toUpperCase());
        }
      });
    }

    const joinMatches = normalizedQuery.matchAll(/JOIN\s+([\w\[\]`""]+)/gi);
    for (const match of joinMatches) {
      const tableName = match[1].replace(/[[\]`"]/g, '').toUpperCase();
      if (tableName) {
        tables.add(tableName);
      }
    }

    return Array.from(tables);
  }

  private checkBlockedKeywords(query: string): boolean {
    const words = query.split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      if (this.BLOCKED_KEYWORDS.includes(cleanWord)) {
        const contextCheck = this.checkContextualSafety(cleanWord, query);
        if (!contextCheck.isSafe) {
          return true;
        }
      }
    }

    const dangerousPatterns = [
      /\;\s*(?:DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)/i,
      /EXEC\s*\(\s*['"`]\s*(?:SELECT|sp_|xp_)/i,
      /sp_\w+/i,
      /xp_\w+/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return true;
      }
    }

    return false;
  }

  private checkContextualSafety(keyword: string, query: string): { isSafe: boolean; reason?: string } {
    const selectIndexMatch = query.indexOf('SELECT');

    if (selectIndexMatch !== -1 && keyword !== 'SELECT') {
      const beforeSelect = query.substring(0, selectIndexMatch).trim();
      if (beforeSelect.length > 0) {
        return { isSafe: false, reason: `Keyword ${keyword} encontrada antes do SELECT` };
      }
    }

    if (keyword === 'CALL' || keyword === 'EXEC' || keyword === 'EXECUTE') {
      if (query.match(/EXEC\s*\(\s*['"`]\s*(?:SELECT|sp_|xp_)/i)) {
        return { isSafe: true };
      }
      return { isSafe: false };
    }

    return { isSafe: true };
  }

  private async validateTablePermissions(tables: string[], codUsuario: number): Promise<boolean> {
    if (tables.length === 0) {
      return true;
    }

    const hasDictionaryAccess = await this.permissionService.checkResourceAccess(
      codUsuario,
      'br.com.sankhya.core.cfg.DicionarioDados',
    );

    if (hasDictionaryAccess.hasAccess) {
      this.logger.debug(`Usuário ${codUsuario} tem acesso ao dicionário, permitindo acesso a todas as tabelas`);
      return true;
    }

    for (const tableName of tables) {
      const hasPermission = await this.permissionValidator.obterDetalhesPermissao(codUsuario, tableName);
      if (!hasPermission) {
        this.logger.warn(`Usuário ${codUsuario} não tem permissão para tabela ${tableName}`);
        return false;
      }
    }

    return true;
  }

  parseParameters(query: string, params: any[]): { parsedQuery: string; values: any[] } {
    const paramPlaceholders = query.match(/\?/g);

    if (!paramPlaceholders) {
      return { parsedQuery: query, values: [] };
    }

    const paramCount = paramPlaceholders.length;
    const values = params.slice(0, paramCount);

    let paramIndex = 0;
    let parsedQuery = query.replace(/\?/g, () => {
      const value = values[paramIndex];
      paramIndex++;
      return this.formatValue(value);
    });

    return { parsedQuery, values };
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }
    const escaped = String(value).replace(/'/g, "''").replace(/\\/g, '\\\\');
    return `'${escaped}'`;
  }
}
