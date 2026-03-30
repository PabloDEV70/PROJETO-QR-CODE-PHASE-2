import { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '@/config/env';
import { verifyJwt } from '@/infra/api-mother/database-context';

const ADMIN_GROUPS = env.ADMIN_CODGRUPOS
  .split(',')
  .map((g) => Number(g.trim()))
  .filter((n) => !Number.isNaN(n));

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token required' });
  }

  const payload = verifyJwt(auth.slice(7), env.JWT_SECRET);
  if (!payload) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
  }

  const codgrupo = typeof payload.codgrupo === 'number' ? payload.codgrupo : Number(payload.codgrupo);
  if (!codgrupo || !ADMIN_GROUPS.includes(codgrupo)) {
    return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Admin access required' });
  }
}
