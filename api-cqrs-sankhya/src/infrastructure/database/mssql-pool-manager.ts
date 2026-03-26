import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConnectionPool } from 'mssql';
import { DatabaseKey, getDatabaseConfig } from '../../config/database.config';

@Injectable()
export class MssqlPoolManager implements OnApplicationShutdown {
  private readonly logger = new Logger(MssqlPoolManager.name);
  private readonly pools = new Map<DatabaseKey, ConnectionPool>();
  private readonly connecting = new Map<DatabaseKey, Promise<ConnectionPool>>();

  async getPool(key: DatabaseKey): Promise<ConnectionPool> {
    const existing = this.pools.get(key);
    if (existing?.connected) return existing;

    const pending = this.connecting.get(key);
    if (pending) return pending;

    const promise = this.createPool(key);
    this.connecting.set(key, promise);

    try {
      const pool = await promise;
      this.pools.set(key, pool);
      return pool;
    } finally {
      this.connecting.delete(key);
    }
  }

  private async createPool(key: DatabaseKey): Promise<ConnectionPool> {
    const config = getDatabaseConfig(key);
    this.logger.log(`Connecting to ${key} (${config.database})...`);

    const pool = new ConnectionPool({
      server: config.server,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      options: {
        encrypt: config.encrypt,
        trustServerCertificate: config.trustServerCertificate,
      },
      connectionTimeout: config.connectionTimeout,
      requestTimeout: config.requestTimeout,
      pool: config.pool,
    });

    pool.on('error', (err) => {
      this.logger.error(`Pool ${key} error: ${err.message}`);
      this.pools.delete(key);
    });

    await pool.connect();
    this.logger.log(`Connected to ${key} (${config.database})`);
    return pool;
  }

  async onApplicationShutdown() {
    this.logger.log('Closing all database pools...');
    const closes = Array.from(this.pools.entries()).map(async ([key, pool]) => {
      try {
        await pool.close();
        this.logger.log(`Pool ${key} closed`);
      } catch (err) {
        this.logger.error(`Error closing pool ${key}: ${err}`);
      }
    });
    await Promise.allSettled(closes);
  }
}
