import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ExecutarQueryUseCase } from './application/use-cases';
import { SqlQueryExecutorAdapter } from './infrastructure/adapters';
import { QueryExecutorController } from './presentation/controllers';

/**
 * Módulo Query Executor
 * Permite execução segura de queries SQL SELECT
 */
@Module({
  imports: [DatabaseModule],
  controllers: [QueryExecutorController],
  providers: [
    ExecutarQueryUseCase,
    {
      provide: 'QueryExecutorPort',
      useClass: SqlQueryExecutorAdapter,
    },
  ],
  exports: [ExecutarQueryUseCase, 'QueryExecutorPort'],
})
export class QueryExecutorModule {}
