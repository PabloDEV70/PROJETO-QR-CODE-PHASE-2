import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../../../shared/logger';

// Rotas permitidas para origens publicas (whitelist restrita)
const PUBLIC_ALLOWED_ROUTES = [
  /^\/armarios\/publico\//,
  /^\/health(\/|$)/,
  /^\/version(\/|$)/,
];

// Origens publicas conhecidas
const PUBLIC_ORIGINS = [
  'https://publico.gigantao.net',
];

/**
 * Public Origin Guard — PRIMEIRA linha de defesa.
 *
 * Se a requisicao vem de uma origem publica (publico.gigantao.net),
 * SOMENTE rotas explicitamente permitidas sao acessiveis.
 * Todas as outras rotas retornam 403.
 *
 * Para origens internas ou sem Origin, nao interfere.
 */
export async function publicOriginGuard(request: FastifyRequest, reply: FastifyReply) {
  if (request.method === 'OPTIONS') return;

  const origin = request.headers.origin || '';
  const referer = request.headers.referer || '';

  const isPublicOrigin = PUBLIC_ORIGINS.some(
    (o) => origin.startsWith(o) || referer.startsWith(o),
  );

  if (!isPublicOrigin) return;

  const url = request.url.split('?')[0];

  if (PUBLIC_ALLOWED_ROUTES.some((re) => re.test(url))) return;

  logger.warn(
    '[PublicOriginGuard] BLOCKED %s %s from origin=%s',
    request.method,
    url,
    origin,
  );

  return reply.status(403).send({
    statusCode: 403,
    error: 'Forbidden',
    message: 'Rota nao disponivel para acesso publico',
  });
}
