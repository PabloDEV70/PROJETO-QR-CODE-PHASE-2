import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingModule } from '../common/logging/logging.module';
import { CorrelationIdMiddleware } from '../common/middleware/correlation-id.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Import ThrottlerModule and ThrottlerGuard
import { AppController } from './app.controller';
import { PublicQueryController } from './public-query.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../modules/auth/auth.module';
import { HealthModule } from '../modules/health/health.module';
import { InspectionModule } from '../modules/inspection/inspection.module';
import { VersionModule } from '../modules/version/version.module';
import { DictionaryModule } from '../modules/dictionary/dictionary.module';
import { MonitoringModule } from '../modules/monitoring/monitoring.module';
import { CustomTablesModule } from '../modules/custom-tables/custom-tables.module';
import { DatabaseExplorerModule } from '../modules/database-explorer/database-explorer.module';
import { MutationV2Module } from '../modules/mutation-v2/mutation-v2.module';
import { QueryExecutorModule } from '../modules/query-executor/query-executor.module';
import { ConstructorModule } from '../modules/constructor/constructor.module';
import { RequestLoggerMiddleware } from '../common/middleware/request-logger.middleware';
import { DatabaseContextMiddleware } from '../common/middleware/database-context.middleware';
import { GlobalResponseInterceptor } from '../common/interceptors/global-response.interceptor';
import { CharTrimInterceptor } from '../common/interceptors/char-trim.interceptor';
import { DatabaseContextInterceptor } from '../common/interceptors/database-context.interceptor';
import { RequestTrackerInterceptor } from '../common/interceptors/request-tracker.interceptor';
import { MetricsInterceptor } from '../common/interceptors/metrics.interceptor';
import { ShutdownStateService } from '../common/services/shutdown-state.service';
import { PermissoesEscritaModule } from '../modules/permissoes-escrita/permissoes-escrita.module';
import { AdminPermissoesModule } from '../modules/admin-permissoes/admin-permissoes.module';
import { CachePermissoesModule } from '../modules/cache-permissoes/cache-permissoes.module';
import { AuditoriaModule } from '../modules/auditoria/auditoria.module';
import { DicionarioModule } from '../modules/dicionario/dicionario.module';
import { UsersModule } from '../users/users.module';
import { MetricsModule } from '../modules/metrics';

@Module({
  imports: [
    LoggingModule,
    MetricsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production'
          ? '.env'
          : ['.env.development.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttleEnabled = config.get<string>('THROTTLE_ENABLED', 'true') === 'true';
        const ttl = parseInt(config.get<string>('THROTTLE_TTL', '60000'), 10);
        const limit = parseInt(config.get<string>('THROTTLE_LIMIT', '100'), 10);

        return throttleEnabled ? [{ ttl, limit }] : [{ ttl: 999999999, limit: 999999 }]; // Effectively disabled
      },
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    VersionModule,
    InspectionModule,
    DictionaryModule, // Clean Architecture V3
    MonitoringModule, // Clean Architecture V3
    CustomTablesModule,
    DatabaseExplorerModule, // Clean Architecture V3
    MutationV2Module, // Clean Architecture - Secure INSERT/UPDATE/DELETE
    QueryExecutorModule, // Clean Architecture V3 - Secure SELECT queries
    ConstructorModule, // Constructor - Dynamic screen building
    PermissoesEscritaModule, // M2 - Permissoes de Escrita (CRUD)
    AdminPermissoesModule, // M5 - Admin API de Permissoes
    CachePermissoesModule, // M6 - Cache de Permissoes
    AuditoriaModule, // M4 - Auditoria de Permissoes
    DicionarioModule, // PRD Dicionário - D1-D9 modules
    UsersModule, // Users API - Complete user data with employee and partner
  ],
  controllers: [AppController, PublicQueryController],
  providers: [
    AppService,
    ShutdownStateService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CharTrimInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DatabaseContextInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTrackerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [ShutdownStateService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, DatabaseContextMiddleware, RequestLoggerMiddleware).forRoutes('*');
  }
}
