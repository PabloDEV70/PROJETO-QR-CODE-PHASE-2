import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SankhyaPermissionService } from '../services/sankhya-permission.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

/**
 * DTO para validação de permissão
 */
class ValidatePermissionDto {
  userId: number;
  resourceId?: string;
  tableName?: string;
}

/**
 * 🔍 CONTROLLER DE DEBUG DE PERMISSÕES
 *
 * Endpoints para troubleshooting e análise de permissões Sankhya.
 * IMPORTANTE: Apenas usuários admin podem acessar estes endpoints.
 *
 * @see SankhyaPermissionService
 */
@ApiTags('Permissions Debug')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('permissions/debug')
export class PermissionsDebugController {
  constructor(
    private readonly permissionService: SankhyaPermissionService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * Verifica se o usuário autenticado é admin
   * TODO: Implementar lógica real de admin (via TSIUSU.NIVEL ou grupo específico)
   */
  private checkIsAdmin(req: any): void {
    const userId = req.user?.userId || req.user?.sub;

    // Por enquanto: apenas SUP (CODUSU=0) ou CARLOS.AQUINO (292) são admin
    // TODO: Implementar verificação via TSIUSU.NIVEL ou grupo admin
    const adminUsers = [0, 292];

    if (!adminUsers.includes(userId)) {
      throw new ForbiddenException('Access denied. Only admin users can access permission debug endpoints.');
    }
  }

  /**
   * GET /permissions/debug/user/:userId/hierarchy
   *
   * Retorna hierarquia completa de permissões do usuário
   * mostrando permissões de user, group e global separadamente
   */
  @Get('user/:userId/hierarchy')
  @ApiOperation({
    summary: 'Obter hierarquia completa de permissões',
    description: 'Retorna permissões do usuário em 3 níveis: diretas, do grupo e globais. Apenas admin.',
  })
  @ApiParam({ name: 'userId', description: 'ID do usuário', example: 292 })
  @ApiResponse({ status: 200, description: 'Hierarquia de permissões retornada' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async getUserHierarchy(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    this.checkIsAdmin(req);

    this.logger.info('Getting permission hierarchy', {
      userId: String(userId),
      requestedBy: String(req.user.userId),
    });

    const hierarchy = await this.permissionService.getUserPermissionHierarchy(userId);

    return {
      message: 'Permission hierarchy retrieved successfully',
      data: hierarchy,
    };
  }

  /**
   * GET /permissions/debug/user/:userId/resources
   *
   * Lista TODOS os recursos (IDACESSOs) que o usuário pode acessar
   * (agregado de user + group + global)
   */
  @Get('user/:userId/resources')
  @ApiOperation({
    summary: 'Listar recursos permitidos',
    description: 'Lista todos os recursos que o usuário pode acessar (agregado). Apenas admin.',
  })
  @ApiParam({ name: 'userId', description: 'ID do usuário', example: 292 })
  @ApiResponse({ status: 200, description: 'Lista de recursos retornada' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async getAllowedResources(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    this.checkIsAdmin(req);

    this.logger.info('Getting allowed resources', { userId: String(userId), requestedBy: String(req.user.userId) });

    const resources = await this.permissionService.getAllowedResources(userId);

    return {
      message: 'Allowed resources retrieved successfully',
      data: {
        userId,
        totalResources: resources.length,
        resources: resources.slice(0, 50), // Primeiros 50 para não sobrecarregar response
        hasMore: resources.length > 50,
      },
    };
  }

  /**
   * GET /permissions/debug/user/:userId/tables
   *
   * Lista TODAS as tabelas que o usuário pode acessar
   * via TDDINS (mapeamento recurso → tabela)
   */
  @Get('user/:userId/tables')
  @ApiOperation({
    summary: 'Listar tabelas permitidas',
    description: 'Lista todas as tabelas que o usuário pode acessar via TDDINS. Apenas admin.',
  })
  @ApiParam({ name: 'userId', description: 'ID do usuário', example: 292 })
  @ApiResponse({ status: 200, description: 'Lista de tabelas retornada' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async getAllowedTables(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    this.checkIsAdmin(req);

    this.logger.info('Getting allowed tables', { userId: String(userId), requestedBy: String(req.user.userId) });

    const tables = await this.permissionService.getAllowedTables(userId);

    return {
      message: 'Allowed tables retrieved successfully',
      data: {
        userId,
        totalTables: tables.length,
        tables: tables.slice(0, 100), // Primeiros 100
        hasMore: tables.length > 100,
      },
    };
  }

  /**
   * POST /permissions/debug/validate
   *
   * Valida acesso a um recurso específico
   * Retorna análise detalhada de por que acesso foi concedido/negado
   */
  @Post('validate')
  @ApiOperation({
    summary: 'Validar permissão específica',
    description: 'Valida se usuário tem acesso a recurso/tabela específica e explica o motivo. Apenas admin.',
  })
  @ApiBody({
    description: 'Dados para validação',
    examples: {
      resource: {
        value: {
          userId: 292,
          resourceId: 'br.com.sankhya.core.cfg.DicionarioDados',
        },
      },
      table: {
        value: {
          userId: 107,
          tableName: 'TGFPAR',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Validação realizada com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  async validatePermission(@Body() dto: ValidatePermissionDto, @Request() req) {
    this.checkIsAdmin(req);

    this.logger.info('Validating permission', {
      userId: String(dto.userId),
      resourceId: dto.resourceId,
      tableName: dto.tableName,
      requestedBy: String(req.user.userId),
    });

    const results: any = {
      userId: dto.userId,
      validations: [],
    };

    // Validar recurso se fornecido
    if (dto.resourceId) {
      const resourceAccess = await this.permissionService.checkResourceAccess(dto.userId, dto.resourceId);
      results.validations.push({
        type: 'resource',
        target: dto.resourceId,
        ...resourceAccess,
      });
    }

    // Validar tabela se fornecida
    if (dto.tableName) {
      const tableAccess = await this.permissionService.checkTableAccess(dto.userId, dto.tableName);
      results.validations.push({
        type: 'table',
        target: dto.tableName,
        hasAccess: tableAccess,
        reason: tableAccess
          ? 'User has access to this table via TDDINS mapping'
          : 'User does not have access to this table',
      });
    }

    return {
      message: 'Permission validation completed',
      data: results,
    };
  }

  /**
   * GET /permissions/debug/cache/stats
   *
   * Estatísticas do cache de permissões
   */
  @Get('cache/stats')
  @ApiOperation({
    summary: 'Estatísticas do cache',
    description: 'Retorna estatísticas sobre o cache de permissões. Apenas admin.',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  getCacheStats(@Request() req) {
    this.checkIsAdmin(req);

    const stats = this.permissionService.getCacheStats();

    return {
      message: 'Cache statistics retrieved',
      data: {
        ...stats,
        ttlMinutes: stats.ttl / (60 * 1000),
      },
    };
  }

  /**
   * POST /permissions/debug/cache/clear
   *
   * Limpar cache de permissões (todos ou usuário específico)
   */
  @Post('cache/clear')
  @ApiOperation({
    summary: 'Limpar cache de permissões',
    description: 'Limpa o cache de permissões. Apenas admin.',
  })
  @ApiBody({
    description: 'ID do usuário (opcional - se omitido, limpa todo cache)',
    required: false,
    examples: {
      specific: { value: { userId: 292 } },
      all: { value: {} },
    },
  })
  @ApiResponse({ status: 200, description: 'Cache limpo com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - apenas admin' })
  clearCache(@Body() body: { userId?: number }, @Request() req) {
    this.checkIsAdmin(req);

    this.permissionService.clearCache(body.userId);

    this.logger.info('Permission cache cleared', {
      userId: body.userId ? String(body.userId) : undefined,
      clearedBy: String(req.user.userId),
    });

    return {
      message: body.userId ? `Cache cleared for user ${body.userId}` : 'All permission cache cleared',
    };
  }
}
