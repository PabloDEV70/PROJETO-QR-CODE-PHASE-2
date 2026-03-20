/**
 * Modulo M6: Cache de Permissoes
 *
 * Este modulo fornece infraestrutura de cache para o sistema de permissoes,
 * melhorando a performance de verificacao de acesso atraves de:
 *
 * - Cache de permissoes verificadas (PermissionCacheService)
 * - Cache de contexto de usuario (UserContextCacheService)
 * - Invalidacao inteligente de cache (CacheInvalidationService)
 * - Metricas de hit/miss (CacheMetricsService)
 * - Job de limpeza automatica (LimparCacheJob)
 * - Monitoramento de alteracoes (MonitorarInvalidacaoJob)
 * - Guard com cache integrado (CachedPermissionGuard)
 *
 * @module M6 - Cache de Permissoes
 * @version 1.0.0
 */

// Module
export * from './cache-permissoes.module';

// Domain
export * from './domain';

// Application
export * from './application';

// Infrastructure
export * from './infrastructure';

// Presentation
export * from './presentation';

// Jobs
export * from './jobs';

// Guards
export * from './guards';
