import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConnectionPoolManager } from '../../../database/connection-pool-manager.service';
import { DatabaseKey } from '../../../config/database.config';

const DATABASES: DatabaseKey[] = ['PROD', 'TESTE', 'TREINA'];
const UNHEALTHY_UTILIZATION_THRESHOLD = 90;

@Injectable()
export class DatabasePoolHealthIndicator extends HealthIndicator {
  constructor(private readonly connectionPoolManager: ConnectionPoolManager) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const utilization: Record<string, string> = {};
      let allHealthy = true;

      for (const db of DATABASES) {
        try {
          const pool = await this.connectionPoolManager.getPool(db);
          const active = (pool as any).size ?? 0;
          // pool.config.pool.max is now populated from SQLSERVER_{KEY}_POOL_MAX env var;
          // fallback 10 matches the getDatabasePoolConfig default
          const max = (pool as any).config?.pool?.max ?? 10;
          const pct = max > 0 ? (active / max) * 100 : 0;
          utilization[db] = `${active}/${max} (${pct.toFixed(1)}%)`;

          if (pct >= UNHEALTHY_UTILIZATION_THRESHOLD) {
            allHealthy = false;
          }
        } catch {
          utilization[db] = 'unavailable';
          allHealthy = false;
        }
      }

      return this.getStatus(key, allHealthy, { utilization });
    } catch (e) {
      throw new HealthCheckError('Database pool check failed', e as Error);
    }
  }
}
