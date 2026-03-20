import { FastifyInstance } from 'fastify';
import { getDatabase, getUserInfo, getUserToken, decodeJwtPayload } from '@/infra/api-mother/database-context';
import {
  isDev, R, B, D, GREEN, YELLOW, RED, CYAN, MAGENTA, WHITE, BLACK,
  BG_RED, BG_YELLOW, BG_GREEN, BG_CYAN, BG_MAGENTA, BG_BLUE,
  clock, msText, devLog,
} from '@/shared/log-colors';

function statusBadge(s: number): string {
  if (s >= 500) return `${BG_RED}${WHITE}${B} ${s} ${R}`;
  if (s >= 400) return `${BG_YELLOW}${BLACK}${B} ${s} ${R}`;
  if (s >= 300) return `${BG_CYAN}${BLACK} ${s} ${R}`;
  return `${BG_GREEN}${BLACK}${B} ${s} ${R}`;
}

function methodBadge(m: string): string {
  const p = m.padEnd(7);
  switch (m) {
    case 'GET':    return `${GREEN}${B}${p}${R}`;
    case 'POST':   return `${CYAN}${B}${p}${R}`;
    case 'PUT':    return `${YELLOW}${B}${p}${R}`;
    case 'PATCH':  return `${MAGENTA}${B}${p}${R}`;
    case 'DELETE': return `${RED}${B}${p}${R}`;
    default:       return `${WHITE}${B}${p}${R}`;
  }
}

function dbBadge(db: string): string {
  if (db === 'PROD')   return `${BG_RED}${WHITE}${B} PROD ${R}`;
  if (db === 'TESTE')  return `${BG_BLUE}${WHITE}${B} TESTE ${R}`;
  return `${BG_MAGENTA}${WHITE}${B} TREINA ${R}`;
}

function userTag(name: string): string {
  if (!name || name === 'anonymous') return `${D}anonymous${R}`;
  return `${WHITE}${B}${name}${R}`;
}

function tokenTtlTag(): string {
  const token = getUserToken();
  if (!token) return '';
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return '';
  const exp = payload.exp as number;
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;
  if (ttl <= 0) return `${RED}${B}expired${R}`;
  const h = Math.floor(ttl / 3600);
  const m = Math.floor((ttl % 3600) / 60);
  const text = h > 0 ? `${h}h${m}m` : `${m}m`;
  if (ttl < 300) return `${RED}ttl:${text}${R}`;
  if (ttl < 900) return `${YELLOW}ttl:${text}${R}`;
  return `${D}ttl:${text}${R}`;
}

export async function registerRequestLogger(app: FastifyInstance): Promise<void> {
  app.addHook('onResponse', async (request, reply) => {
    const route = request.routeOptions?.url ?? request.url;
    if (route === '/health' || route === '/health/deep') return;

    const status = reply.statusCode;
    const elapsed = Math.round(reply.elapsedTime ?? 0);
    const method = request.method;
    const db = getDatabase();
    const info = getUserInfo();
    const user = info.username ?? (info.codusu ? `#${info.codusu}` : 'anonymous');

    const logData: Record<string, unknown> = {
      method, route, status, ms: elapsed, db, user,
    };

    const query = request.query as Record<string, unknown>;
    if (query && Object.keys(query).length > 0) {
      logData.query = query;
    }

    const ttl = tokenTtlTag();

    // Pretty colored output direct to stdout (dev only)
    devLog([
      clock(),
      statusBadge(status),
      methodBadge(method),
      `${WHITE}${route}${R}`,
      msText(elapsed),
      dbBadge(db),
      userTag(user),
      ttl,
    ].filter(Boolean).join(' '));

    // Structured pino log — in dev, devLog handles display; pino only for prod
    if (!isDev) {
      if (status >= 500) {
        request.log.error(logData, `${method} ${route} → ${status} (${elapsed}ms) [${db}] ${user}`);
      } else if (status >= 400) {
        request.log.warn(logData, `${method} ${route} → ${status} (${elapsed}ms) [${db}] ${user}`);
      } else if (elapsed > 3000) {
        request.log.warn(logData, `SLOW ${method} ${route} → ${status} (${elapsed}ms) [${db}] ${user}`);
      } else {
        request.log.info(logData, `${method} ${route} → ${status} (${elapsed}ms) [${db}] ${user}`);
      }
    }
  });
}
