import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { TokenService } from './token.service';

const PREFIX = 'revoked:';

@Injectable()
export class TokenRevocationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenRevocationService.name);
  private redis: Redis | null = null;
  private readonly fallback = new Map<string, number>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
          lazyConnect: true,
        });
        await this.redis.connect();
        this.logger.log('Token revocation connected to Redis');
      } catch (err) {
        this.logger.warn('Redis unavailable, using in-memory fallback: ' + err);
        this.redis = null;
      }
    } else {
      this.logger.log('REDIS_URL not set, using in-memory token revocation');
    }

    if (!this.redis) {
      this.cleanupInterval = setInterval(() => this.cleanupMemory(), 5 * 60_000);
    }
  }

  async onModuleDestroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    if (this.redis) {
      try { await this.redis.quit(); } catch { /* ignore */ }
    }
  }

  async revoke(token: string): Promise<void> {
    const hash = this.hashToken(token);
    const expiration = this.tokenService.getTokenExpiration(token);
    const ttlMs = expiration ? expiration.getTime() - Date.now() : 3600_000;
    const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));

    if (this.redis) {
      try {
        await this.redis.setex(`${PREFIX}${hash}`, ttlSec, '1');
        return;
      } catch (err) {
        this.logger.warn('Redis setex failed, falling back to memory: ' + err);
      }
    }

    this.fallback.set(hash, Date.now() + ttlMs);
  }

  async isRevoked(token: string): Promise<boolean> {
    const hash = this.hashToken(token);

    if (this.redis) {
      try {
        const exists = await this.redis.exists(`${PREFIX}${hash}`);
        return exists === 1;
      } catch (err) {
        this.logger.warn('Redis exists check failed, falling back to memory: ' + err);
      }
    }

    return this.fallback.has(hash);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex').substring(0, 32);
  }

  private cleanupMemory(): void {
    const now = Date.now();
    for (const [key, expiresAt] of this.fallback) {
      if (expiresAt <= now) this.fallback.delete(key);
    }
  }
}
