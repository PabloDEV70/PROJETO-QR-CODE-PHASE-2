import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionPool } from 'mssql';
import { DatabaseKey, getDatabaseConfig, getDatabasePoolConfig } from '../config/database.config';
import { StructuredLogger } from '../common/logging/structured-logger.service';
import { RequestTrackerInterceptor } from '../common/interceptors/request-tracker.interceptor';

@Injectable()
export class ConnectionPoolManager implements OnApplicationShutdown {
  private pools: Map<DatabaseKey, ConnectionPool> = new Map();
  private connecting: Map<DatabaseKey, Promise<ConnectionPool>> = new Map();

  constructor(
    private configService: ConfigService,
    private logger: StructuredLogger,
  ) {}

  async getPool(key: DatabaseKey): Promise<ConnectionPool> {
    const existingPool = this.pools.get(key);
    if (existingPool?.connected) {
      return existingPool;
    }

    const existingPromise = this.connecting.get(key);
    if (existingPromise) {
      return existingPromise;
    }

    const connectionPromise = this.createPool(key);
    this.connecting.set(key, connectionPromise);

    try {
      const pool = await connectionPromise;
      this.pools.set(key, pool);
      return pool;
    } finally {
      this.connecting.delete(key);
    }
  }

  private async createPool(key: DatabaseKey): Promise<ConnectionPool> {
    const config = getDatabaseConfig(this.configService, key);

    if (!config.server || !config.user || !config.database) {
      const missing: string[] = [];
      if (!config.server) missing.push(`SQLSERVER_${key}_SERVER`);
      if (!config.user) missing.push(`SQLSERVER_${key}_USER`);
      if (!config.database) missing.push(`SQLSERVER_${key}_DATABASE`);

      this.logger.error(`Database configuration missing for ${key}`, new Error('Missing config'), {
        missingVars: missing,
      });
      throw new Error(`Database configuration missing for ${key}. Missing: ${missing.join(', ')}`);
    }

    const poolConfig = getDatabasePoolConfig(this.configService, key);

    this.logger.info(`Connecting to database ${key}`, {
      server: config.server,
      database: config.database,
      user: config.user,
    });

    const pool = new ConnectionPool({
      user: config.user,
      password: config.password,
      server: config.server,
      database: config.database,
      options: {
        encrypt: config.encrypt ?? false,
        trustServerCertificate: config.trustServerCertificate ?? true,
      },
      connectionTimeout: 15000,
      requestTimeout: 30000,
      pool: {
        min: poolConfig.min,
        max: poolConfig.max,
        idleTimeoutMillis: poolConfig.idleTimeoutMillis,
      },
    });

    try {
      await pool.connect();
      this.logger.info('Database connection', {
        database: `${key}:${config.database}`,
        success: true,
        pool: { min: poolConfig.min, max: poolConfig.max, idleTimeoutMillis: poolConfig.idleTimeoutMillis },
      });
      return pool;
    } catch (error: any) {
      this.logger.error(`Failed to connect to database ${key}`, error, {
        server: config.server,
        database: config.database,
        errorCode: error?.code,
        errorNumber: error?.number,
      });
      throw error;
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.info(`Graceful shutdown: draining requests`, { signal });

    // Wait for in-flight requests to complete (max 4s drain window)
    const drainDeadline = Date.now() + 4000;
    while (RequestTrackerInterceptor.activeRequests > 0 && Date.now() < drainDeadline) {
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
    }

    const remaining = RequestTrackerInterceptor.activeRequests;
    if (remaining > 0) {
      this.logger.error(
        `Drain timeout: ${remaining} request(s) still active — closing pools anyway`,
        new Error('Drain timeout'),
        { signal },
      );
    } else {
      this.logger.info('All in-flight requests drained — closing connection pools');
    }

    for (const [key, pool] of this.pools) {
      if (pool?.connected) {
        try {
          await Promise.race([
            pool.close(),
            new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error(`Pool close timeout for ${key}`)), 3000)
            ),
          ]);
          this.logger.info(`Closed connection pool for ${key}`);
        } catch (error: any) {
          this.logger.error(`Failed to close pool for ${key}`, error, { signal });
        }
      }
    }
  }
}
