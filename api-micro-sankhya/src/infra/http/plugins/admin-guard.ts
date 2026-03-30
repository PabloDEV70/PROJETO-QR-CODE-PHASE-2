import { FastifyRequest, FastifyReply } from 'fastify';
import { decodeJwtPayload } from '@/infra/api-mother/database-context';

const ADMIN_GROUPS = (process.env.ADMIN_CODGRUPOS || '1')
  .split(',')
  .map((g) => Number(g.trim()))
  .filter((n) => !Number.isNaN(n));

export async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Token required' });
  }

  const payload = decodeJwtPayload(auth.slice(7));
  if (!payload) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
  }

  const codgrupo = typeof payload.codgrupo === 'number' ? payload.codgrupo : Number(payload.codgrupo);
  if (!codgrupo || !ADMIN_GROUPS.includes(codgrupo)) {
    return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Admin access required' });
  }
}
