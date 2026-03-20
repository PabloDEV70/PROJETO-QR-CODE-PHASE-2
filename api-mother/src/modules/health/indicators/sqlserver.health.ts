import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { SqlServerService } from '../../../database/sqlserver.service';

@Injectable()
export class SqlServerHealthIndicator extends HealthIndicator {
  constructor(private readonly sqlServerService: SqlServerService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.sqlServerService.executeSQL('SELECT 1', []);
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('SQL Server check failed', e);
    }
  }
}
