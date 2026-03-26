import { FastifyRequest, FastifyReply } from 'fastify';

const IS_PROD = process.env.NODE_ENV === 'production';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/login/colaborador',
  '/auth/refresh',
];

const PUBLIC_PREFIXES = IS_PROD
  ? ['/health', '/version', '/metrics', '/painel-saidas/stream']
  : ['/health', '/version', '/metrics', '/docs', '/documentation', '/painel-saidas/stream'];
const PUBLIC_PATTERNS = [
  /^\/armarios\/publico\//,
];

const QUERY_TOKEN_PATTERNS = [
  /^\/funcionarios\/\d+\/foto/,
  /^\/funcionarios\/foto\/\d+\/\d+/,
  /^\/produtos\/\d+\/imagem/,
];

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  // Skip CORS preflight requests — handled by @fastify/cors
  if (request.method === 'OPTIONS') {
    return;
  }

  const url = request.url.split('?')[0]; // Strip query string

  if (PUBLIC_AUTH_PATHS.some((p) => url === p)) {
    return;
  }

  if (PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    return;
  }

  if (PUBLIC_PATTERNS.some((re) => re.test(url))) {
    return;
  }

  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ') && QUERY_TOKEN_PATTERNS.some((re) => re.test(url))) {
    const queryToken = (request.query as Record<string, string>)?.token;
    if (queryToken) {
      request.headers.authorization = `Bearer ${queryToken}`;
      return;
    }
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization token',
    });
  }
}
