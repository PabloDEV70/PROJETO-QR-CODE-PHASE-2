import { Controller, Get, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MonitoringService } from '../services/monitoring.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { QueryStatDto } from '../dto/query-stat.dto';
import { ActiveQueryDto } from '../dto/active-query.dto';
import { WaitStatDto } from '../dto/wait-stat.dto';
import { SessionStatDto } from '../dto/session-stat.dto';
import { UserQueryRankingDto } from '../dto/user-query-ranking.dto';
import { HeavyQueryDto } from '../dto/heavy-query.dto';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * Helper to handle errors and return appropriate HTTP status
   */
  private handleError(error: any, operation: string): never {
    this.logger.error(`Failed to ${operation}`, error);

    // Check if it's a ForbiddenException by status code
    if (error?.status === 403 || error?.name === 'ForbiddenException') {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Permission denied',
          error: 'PERMISSION_DENIED',
          detail: error.response || error.message,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    throw new HttpException(
      {
        success: false,
        message: `Failed to ${operation}`,
        error: error.message || 'Unknown error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('permissions')
  @ApiOperation({
    summary: 'Check SQL Server permissions for monitoring',
    description: 'Checks if the current database user has the required permissions (VIEW SERVER STATE) to access DMVs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions check completed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  async getPermissions(): Promise<{
    success: boolean;
    data: { hasViewServerState: boolean; hasViewDatabaseState: boolean };
    message: string;
    timestamp: string;
  }> {
    this.logger.info('GET /monitoring/permissions');

    try {
      const permissions = await this.monitoringService.checkPermissions();

      return {
        success: true,
        data: permissions,
        message: permissions.hasViewServerState
          ? 'Permissões de monitoramento verificadas com sucesso'
          : 'Permissão VIEW SERVER STATE necessária para acessar DMVs de monitoramento. Contate o DBA.',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.handleError(error, 'check permissions');
    }
  }

  @Get('query-stats')
  @ApiOperation({
    summary: 'Get top queries by performance metrics',
    description:
      'Retrieves query execution statistics from SQL Server DMVs (sys.dm_exec_query_stats). Returns queries ordered by CPU time.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of queries to return (default: 50, max: 200)',
  })
  @ApiResponse({
    status: 200,
    description: 'Query statistics retrieved successfully',
    type: [QueryStatDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQueryStats(@Query('limit') limit?: string): Promise<{
    success: boolean;
    data: QueryStatDto[];
    metadata: { count: number; limit: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();
    const queryLimit = Math.min(parseInt(limit || '50', 10) || 50, 200);

    this.logger.info(`GET /monitoring/query-stats with limit=${queryLimit}`);

    try {
      const stats = await this.monitoringService.getQueryStats(queryLimit);
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${stats.length} query stats in ${duration}ms`);

      return {
        success: true,
        data: stats,
        metadata: {
          count: stats.length,
          limit: queryLimit,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve query stats');
    }
  }

  @Get('active-queries')
  @ApiOperation({
    summary: 'Get currently executing queries',
    description:
      'Retrieves real-time information about queries currently being executed on the SQL Server (sys.dm_exec_requests).',
  })
  @ApiResponse({
    status: 200,
    description: 'Active queries retrieved successfully',
    type: [ActiveQueryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getActiveQueries(): Promise<{
    success: boolean;
    data: ActiveQueryDto[];
    metadata: { count: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();

    this.logger.info('GET /monitoring/active-queries');

    try {
      const queries = await this.monitoringService.getActiveQueries();
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${queries.length} active queries in ${duration}ms`);

      return {
        success: true,
        data: queries,
        metadata: {
          count: queries.length,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve active queries');
    }
  }

  @Get('wait-stats')
  @ApiOperation({
    summary: 'Get wait statistics for performance analysis',
    description:
      'Retrieves wait statistics from SQL Server DMVs (sys.dm_os_wait_stats). Useful for identifying performance bottlenecks.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of wait types to return (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Wait statistics retrieved successfully',
    type: [WaitStatDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWaitStats(@Query('limit') limit?: string): Promise<{
    success: boolean;
    data: WaitStatDto[];
    metadata: { count: number; limit: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();
    const queryLimit = Math.min(parseInt(limit || '20', 10) || 20, 100);

    this.logger.info(`GET /monitoring/wait-stats with limit=${queryLimit}`);

    try {
      const stats = await this.monitoringService.getWaitStats(queryLimit);
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${stats.length} wait stats in ${duration}ms`);

      return {
        success: true,
        data: stats,
        metadata: {
          count: stats.length,
          limit: queryLimit,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve wait statistics');
    }
  }

  @Get('session-stats')
  @ApiOperation({
    summary: 'Get active database session information',
    description: 'Retrieves information about active user sessions on the SQL Server (sys.dm_exec_sessions).',
  })
  @ApiResponse({
    status: 200,
    description: 'Session statistics retrieved successfully',
    type: [SessionStatDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSessionStats(): Promise<{
    success: boolean;
    data: SessionStatDto[];
    metadata: { count: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();

    this.logger.info('GET /monitoring/session-stats');

    try {
      const sessions = await this.monitoringService.getSessionStats();
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${sessions.length} sessions in ${duration}ms`);

      return {
        success: true,
        data: sessions,
        metadata: {
          count: sessions.length,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve session statistics');
    }
  }

  @Get('server-overview')
  @ApiOperation({
    summary: 'Get server overview statistics',
    description: 'Retrieves general SQL Server information including version, connections, and current database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Server overview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getServerOverview(): Promise<{
    success: boolean;
    data: any;
    metadata: { executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();

    this.logger.info('GET /monitoring/server-overview');

    try {
      const overview = await this.monitoringService.getServerOverview();
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved server overview in ${duration}ms`);

      return {
        success: true,
        data: overview,
        metadata: {
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve server overview');
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check for monitoring endpoints',
    description: 'Returns health status of the monitoring module.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check passed',
  })
  async getHealth(): Promise<{
    success: boolean;
    service: string;
    status: string;
    timestamp: string;
  }> {
    return {
      success: true,
      service: 'MonitoringModule',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user-ranking')
  @ApiOperation({
    summary: 'Get users ranked by query cost',
    description:
      'Retrieves users ranked by their total query cost, including CPU time, reads, and duration. Identifies source type (Sankhya, DBA tool, external).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of users to return (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'User ranking retrieved successfully',
    type: [UserQueryRankingDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserRanking(@Query('limit') limit?: string): Promise<{
    success: boolean;
    data: UserQueryRankingDto[];
    metadata: { count: number; limit: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();
    const queryLimit = Math.min(parseInt(limit || '20', 10) || 20, 100);

    this.logger.info(`GET /monitoring/user-ranking with limit=${queryLimit}`);

    try {
      const ranking = await this.monitoringService.getUserQueryRanking(queryLimit);
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${ranking.length} user rankings in ${duration}ms`);

      return {
        success: true,
        data: ranking,
        metadata: {
          count: ranking.length,
          limit: queryLimit,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve user ranking');
    }
  }

  @Get('heavy-queries')
  @ApiOperation({
    summary: 'Get heavy queries with severity classification',
    description:
      'Retrieves queries classified by severity (CRITICAL, HIGH, MEDIUM, LOW) based on CPU, reads, and duration. Useful for identifying problematic queries.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of queries to return (default: 50, max: 200)',
  })
  @ApiQuery({
    name: 'minCpu',
    required: false,
    type: Number,
    description: 'Minimum CPU time in ms to include (default: 1000)',
  })
  @ApiResponse({
    status: 200,
    description: 'Heavy queries retrieved successfully',
    type: [HeavyQueryDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHeavyQueries(
    @Query('limit') limit?: string,
    @Query('minCpu') minCpu?: string,
  ): Promise<{
    success: boolean;
    data: HeavyQueryDto[];
    metadata: { count: number; limit: number; minCpuMs: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();
    const queryLimit = Math.min(parseInt(limit || '50', 10) || 50, 200);
    const minCpuMs = parseInt(minCpu || '1000', 10) || 1000;

    this.logger.info(`GET /monitoring/heavy-queries with limit=${queryLimit}, minCpu=${minCpuMs}`);

    try {
      const queries = await this.monitoringService.getHeavyQueries(queryLimit, minCpuMs);
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${queries.length} heavy queries in ${duration}ms`);

      return {
        success: true,
        data: queries,
        metadata: {
          count: queries.length,
          limit: queryLimit,
          minCpuMs,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve heavy queries');
    }
  }

  @Get('sessions-detail')
  @ApiOperation({
    summary: 'Get detailed active sessions with full context',
    description:
      'Retrieves comprehensive information about active sessions including user, IP, machine, program, network details, and current query. Identifies session type (Sankhya, DBA tool, external).',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSessionsDetail(): Promise<{
    success: boolean;
    data: any[];
    metadata: { count: number; executionTimeMs: number; timestamp: string };
  }> {
    const startTime = Date.now();

    this.logger.info('GET /monitoring/sessions-detail');

    try {
      const sessions = await this.monitoringService.getActiveSessionsDetail();
      const duration = Date.now() - startTime;

      this.logger.info(`Successfully retrieved ${sessions.length} detailed sessions in ${duration}ms`);

      return {
        success: true,
        data: sessions,
        metadata: {
          count: sessions.length,
          executionTimeMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      this.handleError(error, 'retrieve detailed sessions');
    }
  }
}
