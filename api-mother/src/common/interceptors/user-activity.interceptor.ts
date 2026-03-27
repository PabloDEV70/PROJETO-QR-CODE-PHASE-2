import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RedisService } from '../services/redis.service';

const TTL_SECONDS = 300; // 5 minutes
const SKIP_PATHS = new Set(['/', '/health', '/version', '/metrics', '/favicon.ico']);
const REQUEST_FEED_KEY = 'request:feed';
const REQUEST_FEED_MAX = 500;

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const path = req.url?.split('?')[0];

        if (SKIP_PATHS.has(path)) return;

        const redis = this.redisService.getClient();
        if (!redis) return;

        const user = req.user;
        const userId = user ? String(user.userId ?? user.sub ?? user.username) : null;
        const username = user?.username ?? 'anonymous';
        const database = req.headers['x-database'] ?? 'TESTE';
        const now = Date.now();
        const durationMs = now - startTime;
        const ip = req.ip ?? req.socket?.remoteAddress ?? '-';

        // Request feed entry — every single request goes here
        const feedEntry = JSON.stringify({
          ts: new Date(now).toISOString(),
          method: req.method,
          path,
          status: res.statusCode,
          durationMs,
          userId: userId ?? '-',
          username,
          database,
          ip,
          userAgent: (req.headers['user-agent'] ?? '').substring(0, 120),
        });

        const pipeline = redis.pipeline();

        // Push to request feed (circular buffer capped at 500)
        pipeline.lpush(REQUEST_FEED_KEY, feedEntry);
        pipeline.ltrim(REQUEST_FEED_KEY, 0, REQUEST_FEED_MAX - 1);

        // User presence tracking (only for authenticated users)
        if (userId) {
          const presenceData = JSON.stringify({
            userId,
            username,
            database,
            ip,
            lastPath: path,
            lastMethod: req.method,
            statusCode: res.statusCode,
            lastSeen: new Date(now).toISOString(),
          });

          pipeline.setex(`user:active:${database}:${userId}`, TTL_SECONDS, presenceData);
          pipeline.zadd(`users:online:${database}`, now, userId);
          pipeline.zremrangebyscore(`users:online:${database}`, '-inf', now - TTL_SECONDS * 1000);
        }

        // Fire-and-forget — never blocks the response
        pipeline.exec().catch(() => {});
      }),
    );
  }
}
