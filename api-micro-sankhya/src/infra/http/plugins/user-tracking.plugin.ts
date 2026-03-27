import { FastifyInstance } from 'fastify';
import { getRedisClient } from '@/infra/redis/redis-client';
import { decodeJwtPayload, VALID_DATABASES, type DatabaseName } from '@/infra/api-mother/database-context';

const TTL_SECONDS = 300;
const SKIP_PATHS = new Set(['/health', '/health/deep', '/version']);
const REQUEST_FEED_KEY = 'request:feed';
const REQUEST_FEED_MAX = 500;

function detectApp(origin?: string, referer?: string): string {
  const url = origin || referer || '';
  if (!url) return '-';
  const patterns: [RegExp, string][] = [
    [/manutencao/i, 'manutencao'],
    [/portaria/i, 'portaria'],
    [/armarios/i, 'armarios'],
    [/publico/i, 'publico'],
    [/chamados/i, 'chamados'],
    [/etiquetas/i, 'etiquetas'],
    [/gestao-veiculos/i, 'gestao-veiculos'],
    [/painel-veiculos|painel\./i, 'painel-veiculos'],
    [/rdomotivos|hhman/i, 'rdo-motivos'],
    [/rdoapontamentos/i, 'rdo-apontamentos'],
    [/tabman/i, 'tabman'],
    [/ti-?admin|tiadmin|:3010/i, 'ti-admin'],
    [/gruposeservicos/i, 'grupos-servicos'],
    [/quadro/i, 'quadro'],
    [/compras/i, 'compras'],
    [/produtoselocais/i, 'produtos-locais'],
    [/cabs/i, 'cabs'],
    [/corridas|taxi/i, 'corridas'],
  ];
  for (const [re, name] of patterns) {
    if (re.test(url)) return name;
  }
  try {
    const u = new URL(url);
    const sub = u.hostname.split('.')[0];
    if (sub && sub !== 'localhost' && sub !== '192') return sub;
    if (u.port) return `port:${u.port}`;
  } catch { /* ignore */ }
  return '-';
}

export async function registerUserTracking(app: FastifyInstance): Promise<void> {
  // Use preHandler to extract user info and store on request object
  app.addHook('preHandler', async (request) => {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = decodeJwtPayload(token);
      if (payload) {
        (request as any)._trackUser = {
          userId: payload.sub != null ? String(payload.sub) : null,
          username: (payload.username as string) ?? (payload.idusu as string) ?? null,
        };
      }
    }

    // Also read from query token (foto routes)
    if (!(request as any)._trackUser) {
      const queryToken = (request.query as Record<string, string>)?.token;
      if (queryToken) {
        const payload = decodeJwtPayload(queryToken);
        if (payload) {
          (request as any)._trackUser = {
            userId: payload.sub != null ? String(payload.sub) : null,
            username: (payload.username as string) ?? (payload.idusu as string) ?? null,
          };
        }
      }
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    const redis = getRedisClient();
    if (!redis) return;

    // Skip CORS preflight and health checks
    if (request.method === 'OPTIONS') return;
    const path = request.url.split('?')[0];
    if (SKIP_PATHS.has(path)) return;

    const status = reply.statusCode;
    const elapsed = Math.round(reply.elapsedTime ?? 0);
    const method = request.method;

    // Read database from header directly (not AsyncLocalStorage)
    const dbHeader = request.headers['x-database-selection'] as string | undefined;
    const db: DatabaseName = dbHeader && VALID_DATABASES.includes(dbHeader as DatabaseName)
      ? (dbHeader as DatabaseName)
      : 'PROD';

    // Read user from request object (set in preHandler)
    const trackUser = (request as any)._trackUser as { userId: string | null; username: string | null } | undefined;
    const userId = trackUser?.userId ?? null;
    const username = trackUser?.username ?? 'anonymous';

    const ip = request.ip ?? request.socket?.remoteAddress ?? '-';
    const origin = request.headers.origin as string | undefined;
    const referer = request.headers.referer as string | undefined;
    const appName = detectApp(origin, referer);
    const now = Date.now();

    const feedEntry = JSON.stringify({
      ts: new Date(now).toISOString(),
      method,
      path,
      status,
      durationMs: elapsed,
      userId: userId ?? '-',
      username,
      database: db,
      ip,
      app: appName,
      userAgent: (request.headers['user-agent'] ?? '').substring(0, 120),
    });

    const pipeline = redis.pipeline();

    // Request feed (circular buffer)
    pipeline.lpush(REQUEST_FEED_KEY, feedEntry);
    pipeline.ltrim(REQUEST_FEED_KEY, 0, REQUEST_FEED_MAX - 1);

    // User presence tracking (only authenticated)
    if (userId && username !== 'anonymous') {
      const presenceData = JSON.stringify({
        userId,
        username,
        database: db,
        ip,
        app: appName,
        lastPath: path,
        lastMethod: method,
        statusCode: status,
        lastSeen: new Date(now).toISOString(),
      });

      pipeline.setex(`user:active:${db}:${userId}`, TTL_SECONDS, presenceData);
      pipeline.zadd(`users:online:${db}`, now, userId);
      pipeline.zremrangebyscore(`users:online:${db}`, '-inf', now - TTL_SECONDS * 1000);
    }

    pipeline.exec().catch(() => {});
  });
}
