import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn('REDIS_URL not set — Redis features disabled');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 2000)),
        lazyConnect: true,
      });
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.warn('Redis connection failed: ' + err);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try { await this.client.quit(); } catch { /* ignore */ }
    }
  }

  get isAvailable(): boolean {
    return this.client !== null && this.client.status === 'ready';
  }

  getClient(): Redis | null {
    return this.client;
  }
}
