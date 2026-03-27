import { FastifyInstance } from 'fastify';
import { getRedisClient } from '@/infra/redis/redis-client';
import { getDatabase, getUserInfo } from '@/infra/api-mother/database-context';

const TTL_SECONDS = 300; // 5 minutes
const SKIP_PATHS = new Set(['/health', '/health/deep', '/version']);
const REQUEST_FEED_KEY = 'request:feed';
const REQUEST_FEED_MAX = 500;

/** Detect app name from Origin/Referer header */
function detectApp(origin?: string, referer?: string): string {
  const url = origin || referer || '';
  if (!url) return '-';
  // Match known app patterns from subdomain or port
  const patterns: [RegExp, string][] = [
    [/manutencao/i, 'manutencao'],
    [/portaria/i, 'portaria'],
    [/armarios/i, 'armarios'],
    [/publico/i, 'publico'],
    [/chamados/i, 'chamados'],
    [/etiquetas/i, 'etiquetas'],
    [/gestao-veiculos/i, 'gestao-veiculos'],
    [/painel-veiculos/i, 'painel-veiculos'],
    [/rdomotivos/i, 'rdo-motivos'],
    [/rdoapontamentos/i, 'rdo-apontamentos'],
    [/tabman/i, 'tabman'],
    [/ti-admin|:3010/i, 'ti-admin'],
    [/gruposeservicos/i, 'grupos-servicos'],
    [/quadro/i, 'quadro'],
    [/compras/i, 'compras'],
    [/produtoselocais/i, 'produtos-locais'],
    [/cabs/i, 'cabs'],
  ];
  for (const [re, name] of patterns) {
    if (re.test(url)) return name;
  }
  // Fallback: extract subdomain or port
  try {
    const u = new URL(url);
    const sub = u.hostname.split('.')[0];
    if (sub && sub !== 'localhost' && sub !== '192') return sub;
    if (u.port) return `port:${u.port}`;
  } catch { /* ignore */ }
  return '-';
}

export async function registerUserTracking(app: FastifyInstance): Promise<void> {
  app.addHook('onResponse', async (request, reply) => {
    const redis = getRedisClient();
    if (!redis) return;

    const path = request.url.split('?')[0];
    if (SKIP_PATHS.has(path)) return;

    const status = reply.statusCode;
    const elapsed = Math.round(reply.elapsedTime ?? 0);
    const method = request.method;
    const db = getDatabase();
    const info = getUserInfo();
    const username = info.username ?? (info.codusu ? `#${info.codusu}` : 'anonymous');
    const userId = info.codusu ? String(info.codusu) : null;
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

    // Fire-and-forget
    pipeline.exec().catch(() => {});
  });
}
