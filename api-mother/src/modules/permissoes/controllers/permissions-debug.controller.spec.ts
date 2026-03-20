import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { PermissionsDebugController } from './permissions-debug.controller';
import { SankhyaPermissionService } from '../services/sankhya-permission.service';
import { AppLogger } from '../../../common/logging/app-logger.service';

describe('PermissionsDebugController', () => {
  let controller: PermissionsDebugController;
  let permissionService: jest.Mocked<SankhyaPermissionService>;
  let logger: jest.Mocked<AppLogger>;

  const mockAdminRequest = {
    user: { userId: 292, sub: 292 },
  };

  const mockNonAdminRequest = {
    user: { userId: 311, sub: 311 },
  };

  beforeEach(async () => {
    const mockPermissionService = {
      getUserPermissionHierarchy: jest.fn(),
      getAllowedResources: jest.fn(),
      getAllowedTables: jest.fn(),
      checkResourceAccess: jest.fn(),
      checkTableAccess: jest.fn(),
      getCacheStats: jest.fn(),
      clearCache: jest.fn(),
    };

    const mockLogger = {
      logInfo: jest.fn(),
      logDebug: jest.fn(),
      logError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsDebugController],
      providers: [
        { provide: SankhyaPermissionService, useValue: mockPermissionService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<PermissionsDebugController>(PermissionsDebugController);
    permissionService = module.get(SankhyaPermissionService);
    logger = module.get(AppLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkIsAdmin', () => {
    it('should allow access for CODUSU=0 (SUP)', () => {
      const request = { user: { userId: 0, sub: 0 } };
      expect(() => controller['checkIsAdmin'](request)).not.toThrow();
    });

    it('should allow access for CODUSU=292 (CARLOS.AQUINO)', () => {
      expect(() => controller['checkIsAdmin'](mockAdminRequest)).not.toThrow();
    });

    it('should deny access for non-admin users', () => {
      expect(() => controller['checkIsAdmin'](mockNonAdminRequest)).toThrow(ForbiddenException);
      expect(() => controller['checkIsAdmin'](mockNonAdminRequest)).toThrow(
        'Access denied. Only admin users can access permission debug endpoints.',
      );
    });
  });

  describe('getUserHierarchy', () => {
    it('should return user hierarchy for admin', async () => {
      const mockHierarchy = {
        userId: 292,
        userName: 'CARLOS.AQUINO',
        codGrupo: 13,
        user: { type: 'user' as const, codUsuOrGrupo: 292, totalPermissions: 464, resources: [] },
        group: { type: 'group' as const, codUsuOrGrupo: 13, totalPermissions: 28, resources: [] },
        global: { type: 'global' as const, codUsuOrGrupo: 0, totalPermissions: 4339, resources: [] },
        aggregatedResources: [],
        totalResources: 4831,
      };

      permissionService.getUserPermissionHierarchy.mockResolvedValue(mockHierarchy);

      const result = await controller.getUserHierarchy(292, mockAdminRequest);

      expect(result.message).toBe('Permission hierarchy retrieved successfully');
      expect(result.data).toEqual(mockHierarchy);
      expect(permissionService.getUserPermissionHierarchy).toHaveBeenCalledWith(292);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(controller.getUserHierarchy(292, mockNonAdminRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllowedResources', () => {
    it('should return allowed resources for admin', async () => {
      const mockResources = ['resource1', 'resource2', 'resource3'];
      permissionService.getAllowedResources.mockResolvedValue(mockResources);

      const result = await controller.getAllowedResources(292, mockAdminRequest);

      expect(result.message).toBe('Allowed resources retrieved successfully');
      expect(result.data.totalResources).toBe(3);
      expect(result.data.resources).toEqual(mockResources);
      expect(result.data.hasMore).toBe(false);
    });

    it('should limit response to first 50 resources', async () => {
      const mockResources = Array.from({ length: 100 }, (_, i) => `resource${i}`);
      permissionService.getAllowedResources.mockResolvedValue(mockResources);

      const result = await controller.getAllowedResources(292, mockAdminRequest);

      expect(result.data.resources).toHaveLength(50);
      expect(result.data.hasMore).toBe(true);
      expect(result.data.totalResources).toBe(100);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(controller.getAllowedResources(292, mockNonAdminRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAllowedTables', () => {
    it('should return allowed tables for admin', async () => {
      const mockTables = ['TGFPAR', 'TSIUSU', 'TDDPER'];
      permissionService.getAllowedTables.mockResolvedValue(mockTables);

      const result = await controller.getAllowedTables(292, mockAdminRequest);

      expect(result.message).toBe('Allowed tables retrieved successfully');
      expect(result.data.totalTables).toBe(3);
      expect(result.data.tables).toEqual(mockTables);
      expect(result.data.hasMore).toBe(false);
    });

    it('should limit response to first 100 tables', async () => {
      const mockTables = Array.from({ length: 150 }, (_, i) => `TABLE${i}`);
      permissionService.getAllowedTables.mockResolvedValue(mockTables);

      const result = await controller.getAllowedTables(292, mockAdminRequest);

      expect(result.data.tables).toHaveLength(100);
      expect(result.data.hasMore).toBe(true);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(controller.getAllowedTables(292, mockNonAdminRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('validatePermission', () => {
    it('should validate resource access', async () => {
      const dto = {
        userId: 292,
        resourceId: 'br.com.sankhya.core.cfg.DicionarioDados',
      };

      permissionService.checkResourceAccess.mockResolvedValue({
        hasAccess: true,
        source: 'user',
        acessoValue: '1',
        reason: 'Access granted via user permissions',
      });

      const result = await controller.validatePermission(dto, mockAdminRequest);

      expect(result.message).toBe('Permission validation completed');
      expect(result.data.validations).toHaveLength(1);
      expect(result.data.validations[0]).toMatchObject({
        type: 'resource',
        target: dto.resourceId,
        hasAccess: true,
        source: 'user',
      });
    });

    it('should validate table access', async () => {
      const dto = {
        userId: 292,
        tableName: 'TGFPAR',
      };

      permissionService.checkTableAccess.mockResolvedValue(true);

      const result = await controller.validatePermission(dto, mockAdminRequest);

      expect(result.data.validations).toHaveLength(1);
      expect(result.data.validations[0]).toMatchObject({
        type: 'table',
        target: 'TGFPAR',
        hasAccess: true,
      });
    });

    it('should validate both resource and table', async () => {
      const dto = {
        userId: 292,
        resourceId: 'some.resource',
        tableName: 'TGFPAR',
      };

      permissionService.checkResourceAccess.mockResolvedValue({
        hasAccess: true,
        source: 'global',
        acessoValue: '1',
        reason: 'Access granted',
      });
      permissionService.checkTableAccess.mockResolvedValue(false);

      const result = await controller.validatePermission(dto, mockAdminRequest);

      expect(result.data.validations).toHaveLength(2);
      expect(result.data.validations[0].type).toBe('resource');
      expect(result.data.validations[1].type).toBe('table');
      expect(result.data.validations[1].hasAccess).toBe(false);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      const dto = { userId: 292, resourceId: 'test' };

      await expect(controller.validatePermission(dto, mockNonAdminRequest)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics for admin', () => {
      permissionService.getCacheStats.mockReturnValue({
        size: 5,
        ttl: 300000, // 5 minutes
      });

      const result = controller.getCacheStats(mockAdminRequest);

      expect(result.message).toBe('Cache statistics retrieved');
      expect(result.data.size).toBe(5);
      expect(result.data.ttl).toBe(300000);
      expect(result.data.ttlMinutes).toBe(5);
    });

    it('should throw ForbiddenException for non-admin', () => {
      expect(() => controller.getCacheStats(mockNonAdminRequest)).toThrow(ForbiddenException);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific user', () => {
      const body = { userId: 292 };

      const result = controller.clearCache(body, mockAdminRequest);

      expect(permissionService.clearCache).toHaveBeenCalledWith(292);
      expect(result.message).toBe('Cache cleared for user 292');
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Permission cache cleared',
        expect.objectContaining({
          userId: '292',
          clearedBy: '292',
        }),
      );
    });

    it('should clear all cache when userId not provided', () => {
      const body = {};

      const result = controller.clearCache(body, mockAdminRequest);

      expect(permissionService.clearCache).toHaveBeenCalledWith(undefined);
      expect(result.message).toBe('All permission cache cleared');
    });

    it('should throw ForbiddenException for non-admin', () => {
      const body = { userId: 292 };

      expect(() => controller.clearCache(body, mockNonAdminRequest)).toThrow(ForbiddenException);
    });
  });
});
