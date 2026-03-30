import { FastifyInstance } from 'fastify';
import { getRedisClient } from '@/infra/redis/redis-client';
import { adminGuard } from '../plugins/admin-guard';

const TTL_MS = 300_000; // 5 minutes

export async function usersOnlineRoutes(app: FastifyInstance) {
  app.addHook('onRequest', adminGuard);
  app.get('/monitoring/users-online', async (request) => {
    const redis = getRedisClient();
    if (!redis) return { online: [], total: 0, source: 'unavailable', message: 'Redis not connected' };

    const database = (request.query as Record<string, string>).database ?? '';
    const databases = database ? [database] : ['PROD', 'TESTE', 'TREINA'];
    const allUsers: Record<string, unknown>[] = [];

    for (const db of databases) {
      const userIds = await redis.zrevrange(`users:online:${db}`, 0, -1);
      if (userIds.length === 0) continue;

      const pipeline = redis.pipeline();
      for (const uid of userIds) {
        pipeline.get(`user:active:${db}:${uid}`);
      }
      const results = await pipeline.exec();
      if (results) {
        for (const [err, val] of results) {
          if (!err && val) {
            try { allUsers.push(JSON.parse(val as string)); } catch { /* skip */ }
          }
        }
      }
    }

    allUsers.sort((a, b) => {
      const ta = new Date(a.lastSeen as string).getTime();
      const tb = new Date(b.lastSeen as string).getTime();
      return tb - ta;
    });

    return { online: allUsers, total: allUsers.length, timestamp: new Date().toISOString() };
  });

  app.get('/monitoring/users-online/count', async (request) => {
    const redis = getRedisClient();
    if (!redis) return { counts: { PROD: 0, TESTE: 0, TREINA: 0 }, total: 0, source: 'unavailable' };

    const database = (request.query as Record<string, string>).database ?? '';
    const databases = database ? [database] : ['PROD', 'TESTE', 'TREINA'];
    const counts: Record<string, number> = { PROD: 0, TESTE: 0, TREINA: 0 };
    let total = 0;

    const now = Date.now();
    for (const db of databases) {
      await redis.zremrangebyscore(`users:online:${db}`, '-inf', now - TTL_MS);
      const count = await redis.zcard(`users:online:${db}`);
      counts[db] = count;
      total += count;
    }

    return { counts, total, timestamp: new Date().toISOString() };
  });

  app.get('/monitoring/request-feed', async (request) => {
    const redis = getRedisClient();
    if (!redis) return { requests: [], total: 0, source: 'unavailable' };

    const limitStr = (request.query as Record<string, string>).limit ?? '100';
    const max = Math.min(Math.max(parseInt(limitStr, 10) || 100, 1), 500);
    const raw = await redis.lrange('request:feed', 0, max - 1);

    const requests: Record<string, unknown>[] = [];
    for (const entry of raw) {
      try { requests.push(JSON.parse(entry)); } catch { /* skip */ }
    }

    return { requests, total: requests.length, timestamp: new Date().toISOString() };
  });

  app.get('/monitoring/login-attempts', async (request) => {
    const redis = getRedisClient();
    if (!redis) return { attempts: [], total: 0, source: 'unavailable' };

    const limitStr = (request.query as Record<string, string>).limit ?? '100';
    const max = Math.min(Math.max(parseInt(limitStr, 10) || 100, 1), 500);
    const raw = await redis.lrange('auth:login:attempts', 0, max - 1);

    const attempts: Record<string, unknown>[] = [];
    for (const entry of raw) {
      try { attempts.push(JSON.parse(entry)); } catch { /* skip */ }
    }

    return { attempts, total: attempts.length, timestamp: new Date().toISOString() };
  });
}
