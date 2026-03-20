import { Injectable, ForbiddenException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

/**
 * Representa a fonte de uma permissão (usuário, grupo ou global)
 */
export interface PermissionSource {
  type: 'user' | 'group' | 'global';
  codUsuOrGrupo: number;
  totalPermissions: number;
  resources: PermissionResource[];
}

/**
 * Representa um recurso com permissão
 */
export interface PermissionResource {
  idAcesso: string;
  acesso: string;
  source: 'user' | 'group' | 'global';
}

/**
 * Hierarquia completa de permissões de um usuário
 */
export interface UserPermissionHierarchy {
  userId: number;
  userName: string;
  codGrupo: number | null;
  user: PermissionSource;
  group: PermissionSource;
  global: PermissionSource;
  aggregatedResources: string[];
  totalResources: number;
}

/**
 * Resultado da verificação de acesso a um recurso
 */
export interface ResourceAccessResult {
  hasAccess: boolean;
  source: 'user' | 'group' | 'global' | null;
  acessoValue: string | null;
  reason: string;
}

/**
 * Resultado da validação de bypass
 */
export interface BypassValidationResult {
  allowed: boolean;
  reason: string;
  auditLog: {
    timestamp: Date;
    userId: number;
    resourceId: string;
    result: 'ALLOWED' | 'DENIED';
    source: string | null;
  };
}

/**
 * 🔐 SERVIÇO CENTRAL DE PERMISSÕES SANKHYA
 *
 * Implementa o modelo completo de permissões do Sankhya:
 * - Hierarquia de 3 níveis: user → group → global (0)
 * - Validação de acesso a recursos
 * - Mapeamento de recursos para tabelas via TDDINS
 * - Detecção de tentativas de bypass
 * - Cache de permissões para performance
 *
 * @see TDDPER - Tabela de permissões
 * @see TSIUSU - Tabela de usuários
 * @see TDDINS - Mapeamento recurso → tabela
 */
@Injectable()
export class SankhyaPermissionService {
  // Cache em memória (simples) - TODO: implementar LRU cache
  private permissionCache = new Map<number, { data: UserPermissionHierarchy; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * 1️⃣ Buscar hierarquia completa de permissões do usuário
   *
   * Retorna permissões de:
   * - Nível 1: Usuário direto (CODUSU = userId)
   * - Nível 2: Grupo (CODUSU = user's CODGRUPO)
   * - Nível 3: Global (CODUSU = 0)
   *
   * @param userId - ID do usuário
   * @returns Hierarquia completa de permissões
   */
  async getUserPermissionHierarchy(userId: number): Promise<UserPermissionHierarchy> {
    // Verificar cache
    const cached = this.permissionCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug('Permission hierarchy retrieved from cache', { userId: String(userId) });
      return cached.data;
    }

    this.logger.info('Building permission hierarchy', { userId: String(userId) });

    // 1. Buscar dados do usuário
    const userQuery = `
      SELECT CODUSU, NOMEUSU, CODGRUPO
      FROM TSIUSU WITH (NOLOCK)
      WHERE CODUSU = @param1
    `;
    const userResult = await this.sqlServerService.executeSQL(userQuery, [userId]);

    if (userResult.length === 0) {
      throw new ForbiddenException(`User ${userId} not found in TSIUSU`);
    }

    const userData = userResult[0];
    const codGrupo = userData.CODGRUPO;

    // 2. Buscar permissões do usuário
    const userPerms = await this.getPermissionsByCodeUser(userId, 'user');

    // 3. Buscar permissões do grupo (se existir)
    const groupPerms =
      codGrupo !== null && codGrupo !== 0
        ? await this.getPermissionsByCodeUser(codGrupo, 'group')
        : { type: 'group' as const, codUsuOrGrupo: 0, totalPermissions: 0, resources: [] };

    // 4. Buscar permissões globais (CODUSU = 0)
    const globalPerms = await this.getPermissionsByCodeUser(0, 'global');

    // 5. Agregar todos os recursos únicos
    const allResources = new Set<string>();
    [...userPerms.resources, ...groupPerms.resources, ...globalPerms.resources].forEach((r) =>
      allResources.add(r.idAcesso),
    );

    const hierarchy: UserPermissionHierarchy = {
      userId,
      userName: userData.NOMEUSU,
      codGrupo,
      user: userPerms,
      group: groupPerms,
      global: globalPerms,
      aggregatedResources: Array.from(allResources),
      totalResources: allResources.size,
    };

    // Cache
    this.permissionCache.set(userId, { data: hierarchy, timestamp: Date.now() });

    this.logger.info('Permission hierarchy built successfully', {
      userId: String(userId),
      userPermissions: userPerms.totalPermissions,
      groupPermissions: groupPerms.totalPermissions,
      globalPermissions: globalPerms.totalPermissions,
      totalAggregated: hierarchy.totalResources,
    });

    return hierarchy;
  }

  /**
   * Busca permissões por CODUSU (pode ser user, group ou global)
   */
  private async getPermissionsByCodeUser(codUsu: number, type: 'user' | 'group' | 'global'): Promise<PermissionSource> {
    const query = `
      SELECT IDACESSO, ACESSO
      FROM TDDPER WITH (NOLOCK)
      WHERE CODUSU = @param1
        AND ACESSO != '0'
    `;

    const result = await this.sqlServerService.executeSQL(query, [codUsu]);

    const resources: PermissionResource[] = result.map((row) => ({
      idAcesso: row.IDACESSO,
      acesso: row.ACESSO,
      source: type,
    }));

    return {
      type,
      codUsuOrGrupo: codUsu,
      totalPermissions: resources.length,
      resources,
    };
  }

  /**
   * 2️⃣ Verificar acesso a recurso específico
   *
   * Verifica se o usuário tem acesso ao recurso em QUALQUER nível
   * (user, group ou global) com ACESSO != '0'
   *
   * @param userId - ID do usuário
   * @param resourceId - ID do recurso (ex: 'br.com.sankhya.core.cfg.DicionarioDados')
   * @returns Resultado com hasAccess, source e acessoValue
   */
  async checkResourceAccess(userId: number, resourceId: string): Promise<ResourceAccessResult> {
    this.logger.debug('Checking resource access', { userId: String(userId), resourceId });

    // Casos especiais: CODUSU=0 (SUP) tem acesso a tudo
    if (userId === 0) {
      return {
        hasAccess: true,
        source: 'global',
        acessoValue: 'ALL',
        reason: 'SUP user (CODUSU=0) has access to all resources',
      };
    }

    // Buscar CODGRUPO
    const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
    const userResult = await this.sqlServerService.executeSQL(userQuery, [userId]);
    const codGrupo = userResult[0]?.CODGRUPO ?? -1;

    // Verificar permissão nos 3 níveis
    const permQuery = `
      SELECT CODUSU, ACESSO
      FROM TDDPER WITH (NOLOCK)
      WHERE IDACESSO = @param1
        AND CODUSU IN (@param2, @param3, 0)
        AND ACESSO != '0'
      ORDER BY
        CASE
          WHEN CODUSU = @param2 THEN 1  -- user tem prioridade
          WHEN CODUSU = @param3 THEN 2  -- depois grupo
          ELSE 3                        -- depois global
        END
    `;

    const permResult = await this.sqlServerService.executeSQL(permQuery, [resourceId, userId, codGrupo]);

    if (permResult.length === 0) {
      return {
        hasAccess: false,
        source: null,
        acessoValue: null,
        reason: `No access to resource '${resourceId}' in any level (user, group, global)`,
      };
    }

    // Determinar a fonte
    const firstMatch = permResult[0];
    let source: 'user' | 'group' | 'global';
    if (firstMatch.CODUSU === userId) source = 'user';
    else if (firstMatch.CODUSU === codGrupo) source = 'group';
    else source = 'global';

    return {
      hasAccess: true,
      source,
      acessoValue: firstMatch.ACESSO,
      reason: `Access granted via ${source} permissions`,
    };
  }

  /**
   * 3️⃣ Listar TODOS os recursos permitidos (agregado)
   *
   * Retorna lista de IDAcessos que o usuário pode acessar
   * em QUALQUER nível (user, group ou global)
   *
   * @param userId - ID do usuário
   * @returns Array de resourceIds permitidos
   */
  async getAllowedResources(userId: number): Promise<string[]> {
    const hierarchy = await this.getUserPermissionHierarchy(userId);
    return hierarchy.aggregatedResources;
  }

  /**
   * 4️⃣ Verificar acesso a tabela via TDDINS
   *
   * Verifica se o usuário pode acessar uma tabela específica
   * através do mapeamento TDDINS (recurso → tabela)
   *
   * @param userId - ID do usuário
   * @param tableName - Nome da tabela
   * @returns true se usuário tem acesso à tabela
   */
  async checkTableAccess(userId: number, tableName: string): Promise<boolean> {
    this.logger.debug('Checking table access', { userId: String(userId), tableName });

    // CODUSU=0 tem acesso a tudo
    if (userId === 0) {
      return true;
    }

    // Buscar CODGRUPO
    const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
    const userResult = await this.sqlServerService.executeSQL(userQuery, [userId]);
    const codGrupo = userResult[0]?.CODGRUPO ?? -1;

    // Verificar se existe mapeamento TDDINS para esta tabela
    // e se o usuário tem permissão ao recurso mapeado
    const query = `
      SELECT COUNT(*) AS total
      FROM TDDINS INS WITH (NOLOCK)
      INNER JOIN TDDPER PER WITH (NOLOCK) ON INS.RESOURCEID = PER.IDACESSO
      WHERE INS.NOMETAB = @param1
        AND PER.CODUSU IN (@param2, @param3, 0)
        AND PER.ACESSO != '0'
    `;

    const result = await this.sqlServerService.executeSQL(query, [tableName, userId, codGrupo]);
    const hasAccess = result[0].total > 0;

    this.logger.debug('Table access check completed', { userId: String(userId), tableName, hasAccess });
    return hasAccess;
  }

  /**
   * 5️⃣ Listar tabelas permitidas (com cache)
   *
   * Retorna lista de tabelas que o usuário pode acessar
   * via TDDINS (mapeamento recurso → tabela)
   *
   * @param userId - ID do usuário
   * @returns Array de nomes de tabelas permitidas
   */
  async getAllowedTables(userId: number): Promise<string[]> {
    this.logger.debug('Getting allowed tables', { userId: String(userId) });

    // CODUSU=0 tem acesso a tudo
    if (userId === 0) {
      const allTablesQuery = `SELECT NOMETAB FROM TDDTAB WITH (NOLOCK) ORDER BY NOMETAB`;
      const result = await this.sqlServerService.executeSQL(allTablesQuery, []);
      return result.map((row) => row.NOMETAB);
    }

    // Buscar CODGRUPO
    const userQuery = `SELECT CODGRUPO FROM TSIUSU WITH (NOLOCK) WHERE CODUSU = @param1`;
    const userResult = await this.sqlServerService.executeSQL(userQuery, [userId]);
    const codGrupo = userResult[0]?.CODGRUPO ?? -1;

    // Buscar tabelas via TDDINS
    const query = `
      SELECT DISTINCT INS.NOMETAB
      FROM TDDINS INS WITH (NOLOCK)
      INNER JOIN TDDPER PER WITH (NOLOCK) ON INS.RESOURCEID = PER.IDACESSO
      WHERE PER.CODUSU IN (@param1, @param2, 0)
        AND PER.ACESSO != '0'
      ORDER BY INS.NOMETAB
    `;

    const result = await this.sqlServerService.executeSQL(query, [userId, codGrupo]);
    const tables = result.map((row) => row.NOMETAB);

    this.logger.info('Allowed tables retrieved', { userId: String(userId), totalTables: tables.length });
    return tables;
  }

  /**
   * 6️⃣ VALIDAÇÃO DE SEGURANÇA: detectar tentativas de bypass
   *
   * Valida que o usuário realmente tem permissão ao recurso solicitado
   * e loga tentativas de bypass para auditoria
   *
   * @param userId - ID do usuário
   * @param requestedResource - Recurso que está sendo acessado
   * @returns Resultado da validação com audit log
   */
  async validateNoBypass(userId: number, requestedResource: string): Promise<BypassValidationResult> {
    const accessCheck = await this.checkResourceAccess(userId, requestedResource);

    const auditLog = {
      timestamp: new Date(),
      userId,
      resourceId: requestedResource,
      result: accessCheck.hasAccess ? ('ALLOWED' as const) : ('DENIED' as const),
      source: accessCheck.source,
    };

    if (!accessCheck.hasAccess) {
      // Log tentativa de bypass
      this.logger.error('🚨 BYPASS ATTEMPT DETECTED', new Error('Unauthorized resource access attempt'), {
        userId: String(userId),
        requestedResource,
        reason: accessCheck.reason,
        timestamp: auditLog.timestamp.toISOString(),
      });
    }

    return {
      allowed: accessCheck.hasAccess,
      reason: accessCheck.reason,
      auditLog,
    };
  }

  /**
   * Limpar cache de permissões (útil após mudanças de permissão)
   */
  clearCache(userId?: number): void {
    if (userId) {
      this.permissionCache.delete(userId);
      this.logger.info('Permission cache cleared for user', { userId: String(userId) });
    } else {
      this.permissionCache.clear();
      this.logger.info('Permission cache cleared completely');
    }
  }

  /**
   * Estatísticas do cache
   */
  getCacheStats(): { size: number; ttl: number } {
    return {
      size: this.permissionCache.size,
      ttl: this.CACHE_TTL,
    };
  }
}
