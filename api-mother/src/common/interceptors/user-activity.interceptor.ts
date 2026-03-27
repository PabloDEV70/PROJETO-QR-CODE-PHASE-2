import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RedisService } from '../services/redis.service';

const TTL_SECONDS = 300; // 5 minutes
const SKIP_PATHS = new Set(['/', '/health', '/version', '/metrics', '/favicon.ico']);

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const path = req.url?.split('?')[0];

        if (SKIP_PATHS.has(path)) return;

        const user = req.user;
        if (!user?.userId && !user?.username) return;

        const redis = this.redisService.getClient();
        if (!redis) return;

        const userId = String(user.userId ?? user.sub ?? user.username);
        const database = req.headers['x-database'] ?? 'TESTE';
        const now = Date.now();

        const data = JSON.stringify({
          userId,
          username: user.username ?? 'unknown',
          database,
          ip: req.ip ?? req.socket?.remoteAddress ?? '-',
          lastPath: path,
          lastMethod: req.method,
          statusCode: res.statusCode,
          lastSeen: new Date(now).toISOString(),
        });

        // Fire-and-forget — never blocks the response
        redis.pipeline()
          .setex(`user:active:${database}:${userId}`, TTL_SECONDS, data)
          .zadd(`users:online:${database}`, now, userId)
          .zremrangebyscore(`users:online:${database}`, '-inf', now - TTL_SECONDS * 1000)
          .exec()
          .catch(() => {}); // Silently ignore Redis errors
      }),
    );
  }
}
