import { Controller, Get } from '@nestjs/common';
import { MssqlPoolManager } from '../../database/mssql-pool-manager';

@Controller()
export class HealthController {
  constructor(private readonly poolManager: MssqlPoolManager) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('health/deep')
  async deepHealth() {
    const databases = ['TESTE', 'PROD', 'TREINA'] as const;
    const checks: Record<string, unknown> = {};

    for (const db of databases) {
      try {
        const pool = await this.poolManager.getPool(db);
        const t0 = Date.now();
        await pool.request().query('SELECT 1 AS ok');
        checks[db] = { status: 'ok', latency_ms: Date.now() - t0 };
      } catch (err) {
        checks[db] = { status: 'error', error: String(err) };
      }
    }

    return {
      status: Object.values(checks).every((c: any) => c.status === 'ok') ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      databases: checks,
    };
  }

  @Get('version')
  version() {
    return {
      name: 'api-cqrs-sankhya',
      version: '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
