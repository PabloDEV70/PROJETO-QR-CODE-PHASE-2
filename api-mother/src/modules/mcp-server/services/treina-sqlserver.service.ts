import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { DatabaseKey } from '../../../config/database.config';
import { getDatabaseConfig } from '../../../config/database.config';

@Injectable()
export class TreinaSqlServerService implements OnModuleInit {
  private readonly logger = new Logger(TreinaSqlServerService.name);
  private pool: sql.ConnectionPool | null = null;
  private readonly databaseKey: DatabaseKey = 'TREINA';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const config = getDatabaseConfig(this.configService, this.databaseKey);

      if (!config.server || !config.database) {
        this.logger.warn(`Database ${this.databaseKey} not configured, MCP will use default connection`);
        return;
      }

      const poolConfig: sql.config = {
        server: config.server,
        database: config.database,
        user: config.user,
        password: config.password,
        options: {
          encrypt: config.encrypt ?? false,
          trustServerCertificate: config.trustServerCertificate ?? true,
          enableArithAbort: true,
        },
        requestTimeout: 30000,
      };

      this.pool = await sql.connect(poolConfig);
      this.logger.log(`Connected to ${this.databaseKey}: ${config.server}/${config.database}`);
    } catch (error: any) {
      this.logger.error(`Failed to connect to ${this.databaseKey}: ${error.message}`);
    }
  }

  async executeSQL(query: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) {
      throw new Error(`Not connected to ${this.databaseKey}`);
    }

    const startTime = Date.now();

    try {
      const request = this.pool.request();

      for (let i = 0; i < params.length; i++) {
        const paramName = `param${i}`;
        request.input(paramName, params[i]);
      }

      const result = await request.query(query);

      const executionTime = Date.now() - startTime;
      this.logger.debug(`Query executed in ${executionTime}ms on ${this.databaseKey}`);

      return result.recordset || [];
    } catch (error: any) {
      this.logger.error(`Query failed on ${this.databaseKey}: ${error.message}`);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.logger.log(`Connection to ${this.databaseKey} closed`);
    }
  }

  isConnected(): boolean {
    return this.pool !== null;
  }
}
