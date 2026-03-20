import { FastifyRequest } from 'fastify';

export function extractUserToken(request: FastifyRequest): string | undefined {
  const auth = request.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return (request.query as Record<string, string>)?.token;
}
