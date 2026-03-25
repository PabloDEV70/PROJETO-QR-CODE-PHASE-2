import { Controller, Get, Req, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SqlServerHealthIndicator } from '../indicators/sqlserver.health';
import { SystemHealthIndicator } from '../indicators/system.health';
import { DatabasePoolHealthIndicator } from '../indicators/database-pool.health';
import { LatencySLAHealthIndicator } from '../indicators/latency-sla.health';
import { SqlServerService } from '../../../database/sqlserver.service';
import { ShutdownStateService } from '../../../common/services/shutdown-state.service';
import { SkipEnvelope } from '../../../common/decorators/skip-envelope.decorator';
import { Request } from 'express';

// Version constant - update when package.json version changes
const APP_VERSION = '0.0.1';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private sql: SqlServerHealthIndicator,
    private system: SystemHealthIndicator,
    private poolHealth: DatabasePoolHealthIndicator,
    private latencySla: LatencySLAHealthIndicator,
    private sqlServerService: SqlServerService,
    private shutdownState: ShutdownStateService,
  ) {}

  @Get()
  @HealthCheck()
  @SkipEnvelope()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({ status: 200, description: 'Health status with system and database info' })
  @ApiResponse({ status: 503, description: 'Service is shutting down' })
  async check(@Req() req: Request) {
    if (this.shutdownState.isInShutdown()) {
      throw new ServiceUnavailableException({ status: 'shutting_down' });
    }

    const health = await this.health.check([
      () => this.sql.isHealthy('sqlserver'),
      () => this.system.isHealthy('system'),
      () => this.poolHealth.isHealthy('pool_utilization'),
      () => this.latencySla.isHealthy('latency_sla'),
    ]);

    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return { status: health.status };
    }

    const database = req.get('X-Database')?.toUpperCase() || 'PROD';
    return {
      ...health,
      version: APP_VERSION,
      uptime: process.uptime(),
      startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      database,
    };
  }

  @Get('db-ping')
  @ApiOperation({ summary: 'Test database connection and query execution' })
  @ApiResponse({ status: 200, description: 'Database is accessible and queries work' })
  @ApiResponse({ status: 503, description: 'Service is shutting down' })
  @ApiResponse({ status: 500, description: 'Database connection or query failed' })
  async dbPing() {
    if (this.shutdownState.isInShutdown()) {
      throw new ServiceUnavailableException({ status: 'shutting_down' });
    }

    try {
      await this.sqlServerService.executeSQL('SELECT 1 as ping', []);
      return { status: 'ok', message: 'Database connection and query successful' };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection or query failed',
        error: error.message,
      };
    }
  }

  @Get('db-connect')
  @ApiOperation({ summary: 'Test database server reachability' })
  @ApiResponse({ status: 200, description: 'Database server is reachable' })
  @ApiResponse({ status: 503, description: 'Service is shutting down' })
  @ApiResponse({ status: 500, description: 'Database server not reachable' })
  async dbConnect() {
    if (this.shutdownState.isInShutdown()) {
      throw new ServiceUnavailableException({ status: 'shutting_down' });
    }

    const result = await this.sqlServerService.ping();
    if (result.connected) {
      return { status: 'ok', message: 'Database server is reachable' };
    } else {
      return { status: 'error', message: 'Database server not reachable', error: result.error };
    }
  }

  @Get('check-me')
  @ApiOperation({ summary: 'Simple health check' })
  @ApiResponse({ status: 200, description: 'Service is running' })
  checkMe() {
    return { status: 'ok', message: 'API is running', timestamp: new Date().toISOString() };
  }
}
