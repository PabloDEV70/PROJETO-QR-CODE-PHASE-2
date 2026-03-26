import { Global, Module } from '@nestjs/common';
import { MssqlPoolManager } from './mssql-pool-manager';
import { ReadQueryExecutor } from './read-query-executor';

@Global()
@Module({
  providers: [MssqlPoolManager, ReadQueryExecutor],
  exports: [MssqlPoolManager, ReadQueryExecutor],
})
export class DatabaseModule {}
