/**
 * CachePermissoesModule - Modulo de Cache de Permissoes.
 *
 * Fornece infraestrutura de cache para o sistema de permissoes,
 * melhorando a performance de verificacao de acesso.
 *
 * @module M6 - Cache de Permissoes
 * @task M6-T11
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain
import { CACHE_PROVIDER } from './domain/repositories/cache-provider.interface';

// Infrastructure - Providers
import { MemoryCacheProvider } from './infrastructure/providers/memory-cache.provider';
// RedisCacheProvider disponivel mas nao utilizado por padrao
// import { RedisCacheProvider, REDIS_CLIENT } from './infrastructure/providers/redis-cache.provider';

// Application - Services
import { PermissionCacheService } from './application/services/permission-cache.service';
import { UserContextCacheService } from './application/services/user-context-cache.service';
import { CacheInvalidationService } from './application/services/cache-invalidation.service';
import { CacheMetricsService } from './application/services/cache-metrics.service';

// Jobs
import { LimparCacheJob } from './jobs/limpar-cache.job';
import { MonitorarInvalidacaoJob, QUERY_EXECUTOR } from './jobs/monitorar-invalidacao.job';

// Guards
import { CachedPermissionGuard } from './guards/cached-permission.guard';

// Presentation
import { CachePermissoesController } from './presentation/controllers/cache-permissoes.controller';

// Factory para decidir qual provider usar
const cacheProviderFactory = {
  provide: CACHE_PROVIDER,
  useFactory: (configService: ConfigService, memoryProvider: MemoryCacheProvider) => {
    const useRedis = configService.get<string>('CACHE_USE_REDIS') === 'true';

    if (useRedis) {
      // Se Redis configurado, usar RedisCacheProvider (com fallback para Memory)
      // Por ora, usar apenas Memory pois Redis requer dependencia adicional
      return memoryProvider;
    }

    return memoryProvider;
  },
  inject: [ConfigService, MemoryCacheProvider],
};

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [CachePermissoesController],
  providers: [
    // Providers de cache
    MemoryCacheProvider,

    // Factory para selecao de provider
    cacheProviderFactory,

    // Services
    PermissionCacheService,
    UserContextCacheService,
    CacheInvalidationService,
    CacheMetricsService,

    // Jobs
    LimparCacheJob,
    MonitorarInvalidacaoJob,

    // Guards
    CachedPermissionGuard,

    // Provider opcional para QueryExecutor (desabilitado por padrao)
    {
      provide: QUERY_EXECUTOR,
      useValue: null, // Implementar integracao com SqlServerService se necessario
    },
  ],
  exports: [
    // Exportar interface e provider
    CACHE_PROVIDER,
    MemoryCacheProvider,

    // Exportar services
    PermissionCacheService,
    UserContextCacheService,
    CacheInvalidationService,
    CacheMetricsService,

    // Exportar guard
    CachedPermissionGuard,
  ],
})
export class CachePermissoesModule {}
