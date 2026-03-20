import { Global, Module } from '@nestjs/common';
import { SqlServerService } from './sqlserver.service';
import { MonitoringSqlServerService } from './monitoring-sqlserver.service';
import { ConnectionPoolManager } from './connection-pool-manager.service';
import { DatabaseContextService } from './database-context.service';

@Global()
@Module({
  providers: [SqlServerService, MonitoringSqlServerService, ConnectionPoolManager, DatabaseContextService],
  exports: [SqlServerService, MonitoringSqlServerService, ConnectionPoolManager, DatabaseContextService],
})
export class DatabaseModule {}
