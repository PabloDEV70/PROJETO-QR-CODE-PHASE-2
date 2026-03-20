import { Test, TestingModule } from '@nestjs/testing';
import { SankhyaPermissionService } from './sankhya-permission.service';
import { SqlServerService } from '../../../database/sqlserver.service';
import { AppLogger } from '../../../common/logging/app-logger.service';

describe('SankhyaPermissionService', () => {
  let service: SankhyaPermissionService;
  let sqlServerService: jest.Mocked<SqlServerService>;
  let logger: jest.Mocked<AppLogger>;

  beforeEach(async () => {
    // Mock SqlServerService
    const mockSqlServerService = {
      executeSQL: jest.fn(),
    };

    // Mock AppLogger
    const mockLogger = {
      logInfo: jest.fn(),
      logDebug: jest.fn(),
      logError: jest.fn(),
      logWarning: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SankhyaPermissionService,
        { provide: SqlServerService, useValue: mockSqlServerService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<SankhyaPermissionService>(SankhyaPermissionService);
    sqlServerService = module.get(SqlServerService);
    logger = module.get(AppLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.clearCache(); // Clear cache between tests
  });

  describe('getUserPermissionHierarchy', () => {
    it('should return complete hierarchy for user with group', async () => {
      // Mock user data
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 292, NOMEUSU: 'CARLOS.AQUINO', CODGRUPO: 13 }])
        // Mock user permissions
        .mockResolvedValueOnce([
          { IDACESSO: 'resource1', ACESSO: '1' },
          { IDACESSO: 'resource2', ACESSO: '1' },
        ])
        // Mock group permissions
        .mockResolvedValueOnce([{ IDACESSO: 'resource3', ACESSO: '1' }])
        // Mock global permissions
        .mockResolvedValueOnce([{ IDACESSO: 'resource4', ACESSO: '1' }]);

      const result = await service.getUserPermissionHierarchy(292);

      expect(result).toMatchObject({
        userId: 292,
        userName: 'CARLOS.AQUINO',
        codGrupo: 13,
        totalResources: 4,
      });
      expect(result.user.totalPermissions).toBe(2);
      expect(result.group.totalPermissions).toBe(1);
      expect(result.global.totalPermissions).toBe(1);
      expect(result.aggregatedResources).toContain('resource1');
      expect(result.aggregatedResources).toContain('resource2');
      expect(result.aggregatedResources).toContain('resource3');
      expect(result.aggregatedResources).toContain('resource4');
    });

    it('should handle user without group', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 311, NOMEUSU: 'CONVIDADO', CODGRUPO: null }])
        .mockResolvedValueOnce([{ IDACESSO: 'resource1', ACESSO: '1' }])
        .mockResolvedValueOnce([]);

      const result = await service.getUserPermissionHierarchy(311);

      expect(result.codGrupo).toBeNull();
      expect(result.group.totalPermissions).toBe(0);
    });

    it('should use cache on subsequent calls', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 292, NOMEUSU: 'CARLOS.AQUINO', CODGRUPO: 13 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // First call
      await service.getUserPermissionHierarchy(292);
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(4);

      // Second call - should use cache
      await service.getUserPermissionHierarchy(292);
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(4); // No new calls
    });

    it('should throw error if user not found', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([]);

      await expect(service.getUserPermissionHierarchy(999)).rejects.toThrow('User 999 not found in TSIUSU');
    });
  });

  describe('checkResourceAccess', () => {
    it('should return true for SUP user (CODUSU=0)', async () => {
      const result = await service.checkResourceAccess(0, 'any.resource');

      expect(result).toMatchObject({
        hasAccess: true,
        source: 'global',
        acessoValue: 'ALL',
        reason: 'SUP user (CODUSU=0) has access to all resources',
      });
      expect(sqlServerService.executeSQL).not.toHaveBeenCalled();
    });

    it('should return true when user has direct permission', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ CODUSU: 292, ACESSO: '1' }]);

      const result = await service.checkResourceAccess(292, 'br.com.sankhya.core.cfg.DicionarioDados');

      expect(result).toMatchObject({
        hasAccess: true,
        source: 'user',
        acessoValue: '1',
      });
    });

    it('should return true when group has permission', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ CODUSU: 13, ACESSO: '1' }]);

      const result = await service.checkResourceAccess(292, 'some.resource');

      expect(result).toMatchObject({
        hasAccess: true,
        source: 'group',
      });
    });

    it('should return true when global has permission', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ CODUSU: 0, ACESSO: '1' }]);

      const result = await service.checkResourceAccess(292, 'some.resource');

      expect(result).toMatchObject({
        hasAccess: true,
        source: 'global',
      });
    });

    it('should return false when no permission found', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([{ CODGRUPO: 13 }]).mockResolvedValueOnce([]);

      const result = await service.checkResourceAccess(292, 'forbidden.resource');

      expect(result).toMatchObject({
        hasAccess: false,
        source: null,
        acessoValue: null,
      });
      expect(result.reason).toContain('No access to resource');
    });

    it('should prioritize user over group over global', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        // The query returns ordered by priority, so user (292) comes first
        .mockResolvedValueOnce([
          { CODUSU: 292, ACESSO: '3' },
          { CODUSU: 13, ACESSO: '2' },
          { CODUSU: 0, ACESSO: '1' },
        ]);

      const result = await service.checkResourceAccess(292, 'some.resource');

      expect(result.source).toBe('user');
      expect(result.acessoValue).toBe('3');
    });
  });

  describe('getAllowedResources', () => {
    it('should return aggregated resources from hierarchy', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 292, NOMEUSU: 'CARLOS', CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ IDACESSO: 'res1', ACESSO: '1' }])
        .mockResolvedValueOnce([{ IDACESSO: 'res2', ACESSO: '1' }])
        .mockResolvedValueOnce([{ IDACESSO: 'res3', ACESSO: '1' }]);

      const result = await service.getAllowedResources(292);

      expect(result).toHaveLength(3);
      expect(result).toContain('res1');
      expect(result).toContain('res2');
      expect(result).toContain('res3');
    });
  });

  describe('checkTableAccess', () => {
    it('should return true for SUP user', async () => {
      const result = await service.checkTableAccess(0, 'TGFPAR');

      expect(result).toBe(true);
      expect(sqlServerService.executeSQL).not.toHaveBeenCalled();
    });

    it('should return true when user has TDDINS permission', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([{ CODGRUPO: 13 }]).mockResolvedValueOnce([{ total: 1 }]);

      const result = await service.checkTableAccess(292, 'TGFPAR');

      expect(result).toBe(true);
    });

    it('should return false when user has no TDDINS permission', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([{ CODGRUPO: 13 }]).mockResolvedValueOnce([{ total: 0 }]);

      const result = await service.checkTableAccess(292, 'FORBIDDEN_TABLE');

      expect(result).toBe(false);
    });
  });

  describe('getAllowedTables', () => {
    it('should return all tables for SUP user', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([
        { NOMETAB: 'TGFPAR' },
        { NOMETAB: 'TSIUSU' },
        { NOMETAB: 'TDDPER' },
      ]);

      const result = await service.getAllowedTables(0);

      expect(result).toHaveLength(3);
      expect(result).toContain('TGFPAR');
    });

    it('should return filtered tables for regular user', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ NOMETAB: 'TGFPAR' }, { NOMETAB: 'TSIUSU' }]);

      const result = await service.getAllowedTables(292);

      expect(result).toHaveLength(2);
      expect(result).toContain('TGFPAR');
      expect(result).toContain('TSIUSU');
    });
  });

  describe('validateNoBypass', () => {
    it('should return allowed=true for valid access', async () => {
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODGRUPO: 13 }])
        .mockResolvedValueOnce([{ CODUSU: 292, ACESSO: '1' }]);

      const result = await service.validateNoBypass(292, 'some.resource');

      expect(result.allowed).toBe(true);
      expect(result.auditLog.result).toBe('ALLOWED');
      expect(logger.logError).not.toHaveBeenCalled();
    });

    it('should log bypass attempt for unauthorized access', async () => {
      sqlServerService.executeSQL.mockResolvedValueOnce([{ CODGRUPO: 13 }]).mockResolvedValueOnce([]);

      const result = await service.validateNoBypass(292, 'forbidden.resource');

      expect(result.allowed).toBe(false);
      expect(result.auditLog.result).toBe('DENIED');
      expect(logger.logError).toHaveBeenCalledWith(
        '🚨 BYPASS ATTEMPT DETECTED',
        expect.any(Error),
        expect.objectContaining({
          userId: '292',
          requestedResource: 'forbidden.resource',
        }),
      );
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific user', async () => {
      // First set of mocks for initial cache build
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 292, NOMEUSU: 'CARLOS', CODGRUPO: 13 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Build cache
      await service.getUserPermissionHierarchy(292);
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(4);

      // Clear cache for this user
      service.clearCache(292);

      // Second set of mocks for cache rebuild
      sqlServerService.executeSQL
        .mockResolvedValueOnce([{ CODUSU: 292, NOMEUSU: 'CARLOS', CODGRUPO: 13 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      // Should rebuild cache (4 new calls)
      await service.getUserPermissionHierarchy(292);
      expect(sqlServerService.executeSQL).toHaveBeenCalledTimes(8);
    });

    it('should clear all cache when no userId provided', () => {
      service.clearCache();

      expect(logger.logInfo).toHaveBeenCalledWith('Permission cache cleared completely');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('ttl');
      expect(stats.ttl).toBe(5 * 60 * 1000); // 5 minutes
    });
  });
});
