import { Injectable, Logger } from '@nestjs/common';
import { MssqlPoolManager } from './mssql-pool-manager';
import { validateReadOnly } from './sql-validator';
import { DatabaseKey } from '../../config/database.config';

@Injectable()
export class ReadQueryExecutor {
  private readonly logger = new Logger(ReadQueryExecutor.name);

  constructor(private readonly poolManager: MssqlPoolManager) {}

  async execute<T = Record<string, unknown>>(
    sql: string,
    database: DatabaseKey,
  ): Promise<T[]> {
    validateReadOnly(sql);

    const pool = await this.poolManager.getPool(database);
    const t0 = Date.now();

    const cleanSql = sql.replace(/--.*$/gm, '').replace(/\s+/g, ' ').trim();

    try {
      const result = await pool.request().query(cleanSql);
      const elapsed = Date.now() - t0;
      const rows = result.recordset ?? [];

      if (elapsed > 3000) {
        this.logger.warn(`SLOW query ${elapsed}ms | ${rows.length} rows | ${database}`);
      } else {
        this.logger.debug(`Query OK ${elapsed}ms | ${rows.length} rows | ${database}`);
      }

      return rows as T[];
    } catch (err) {
      const elapsed = Date.now() - t0;
      this.logger.error(`Query FAIL ${elapsed}ms | ${database} | ${err}`);
      throw err;
    }
  }
}
