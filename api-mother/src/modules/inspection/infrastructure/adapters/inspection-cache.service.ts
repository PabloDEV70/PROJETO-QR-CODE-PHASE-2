/**
 * InspectionCacheService
 *
 * In-memory TTL cache for inspection queries (schema, PK, relations, table list).
 * Uses a plain Map — no external dependency. Keys are scoped by database to prevent
 * cross-database collisions (PROD vs TESTE vs TREINA).
 *
 * Cache hits and misses are reported as Prometheus counters via MetricsService
 * (cache_hits_total and cache_misses_total with endpoint label).
 */
import { Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getInspectionCacheConfig } from '../../../../config/database.config';
import { MetricsService } from '../../../metrics/metrics.service';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class InspectionCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(InspectionCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly schemaTtlMs: number;
  private readonly listTtlMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Optional() private readonly metricsService: MetricsService | null,
  ) {
    const cfg = getInspectionCacheConfig(configService);
    this.schemaTtlMs = cfg.schemaTtlSeconds * 1000;
    this.listTtlMs = cfg.listTtlSeconds * 1000;
    this.cleanupInterval = setInterval(() => this.evictExpired(), 60_000);
    this.logger.log(
      `InspectionCacheService initialized — schemaTTL=${cfg.schemaTtlSeconds}s listTTL=${cfg.listTtlSeconds}s`,
    );
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  get<T>(key: string, endpoint: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.metricsService?.recordCacheMiss(endpoint);
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.metricsService?.recordCacheMiss(endpoint);
      return null;
    }
    this.metricsService?.recordCacheHit(endpoint);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Key generators — scoped by database to prevent cross-DB collisions

  schemaKey(database: string, tableName: string): string {
    return `schema:${database}:${tableName.toUpperCase()}`;
  }

  relationsKey(database: string, tableName: string): string {
    return `relations:${database}:${tableName.toUpperCase()}`;
  }

  primaryKeysKey(database: string, tableName: string): string {
    return `pk:${database}:${tableName.toUpperCase()}`;
  }

  tableListKey(database: string): string {
    return `tables:${database}`;
  }

  get schemaTtl(): number {
    return this.schemaTtlMs;
  }

  get listTtl(): number {
    return this.listTtlMs;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
