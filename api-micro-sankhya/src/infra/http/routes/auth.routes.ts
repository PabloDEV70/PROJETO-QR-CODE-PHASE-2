import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../../../domain/services/auth.service';
import { ApiMotherAuthService } from '../../api-mother/login';
import { decodeJwtPayload, verifyJwt } from '../../api-mother/database-context';
import { isDev, devLog, R, B, D, GREEN, CYAN, YELLOW, MAGENTA } from '../../../shared/log-colors';
import { getRedisClient } from '@/infra/redis/redis-client';
import { env } from '@/config/env';

const LOGIN_ATTEMPTS_KEY = 'auth:login:attempts';
const LOGIN_ATTEMPTS_MAX = 500;

async function validateTurnstile(token: string | undefined): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true; // skip if not configured
  if (!token) return false; // token required when secret is configured
  try {
    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });
    const data = await resp.json() as { success: boolean };
    return data.success === true;
  } catch {
    return true; // fail open if Cloudflare is unreachable
  }
}

function recordLoginAttempt(
  username: string,
  ip: string,
  userAgent: string,
  origin: string,
  success: boolean,
  error?: string,
) {
  const redis = getRedisClient();
  if (!redis) return;

  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    username,
    ip,
    userAgent: userAgent.substring(0, 120),
    origin,
    success,
    ...(error ? { error } : {}),
  });

  redis.pipeline()
    .lpush(LOGIN_ATTEMPTS_KEY, entry)
    .ltrim(LOGIN_ATTEMPTS_KEY, 0, LOGIN_ATTEMPTS_MAX - 1)
    .exec()
    .catch(() => {});
}

function formatTokenInfo(token: string, label: string): string {
  const payload = decodeJwtPayload(token);
  if (!payload) return `${label}: invalid`;
  const iat = payload.iat as number | undefined;
  const exp = payload.exp as number | undefined;
  const sub = payload.sub;
  const username = payload.username as string | undefined;
  if (!exp) return `${label}: no expiry`;
  const now = Math.floor(Date.now() / 1000);
  const ttl = exp - now;
  const h = Math.floor(ttl / 3600);
  const m = Math.floor((ttl % 3600) / 60);
  const ttlText = h > 0 ? `${h}h ${m}min` : `${m}min`;
  return `${label}: user=${username ?? sub} ttl=${ttlText}`;
}

const loginStandardSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  turnstileToken: z.string().optional(),
});

const loginColaboradorSchema = z.object({
  codparc: z.number().int().positive(),
  cpf: z.string().min(11),
  turnstileToken: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  app.post('/auth/login', async (request, reply) => {
    const ip = request.ip;
    const ua = request.headers['user-agent'] ?? '';
    const origin = request.headers.origin ?? 'unknown';

    request.log.info(
      { origin, ip, ua: ua.substring(0, 80) },
      '[AUTH] Login attempt from %s',
      ip,
    );

    let username: string;
    let password: string;
    let turnstileToken: string | undefined;
    try {
      const parsed = loginStandardSchema.parse(request.body);
      username = parsed.username;
      password = parsed.password;
      turnstileToken = parsed.turnstileToken;
    } catch (err) {
      request.log.warn(
        { ip, origin },
        '[AUTH] Login validation failed — invalid payload',
      );
      throw err;
    }

    const turnstileOk = await validateTurnstile(turnstileToken);
    if (!turnstileOk) {
      recordLoginAttempt(username, ip, ua, origin, false, 'Turnstile verification failed');
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Verificacao humana falhou. Tente novamente.',
      });
    }

    request.log.info('[AUTH] Login standard user="%s" ip=%s origin=%s', username, ip, origin);

    try {
      const result = await authService.loginStandard(username, password, ip, ua);
      const tokenInfo = formatTokenInfo(result.token, 'token');
      const refreshInfo = result.refreshToken ? formatTokenInfo(result.refreshToken, 'refresh') : '';
      request.log.info('[AUTH] Login SUCCESS user="%s" ip=%s', username, ip);
      devLog(`  ${GREEN}${B}LOGIN OK${R} ${CYAN}${username}${R} ${D}|${R} ${tokenInfo} ${D}|${R} ${refreshInfo}`);
      recordLoginAttempt(username, ip, ua, origin, true);
      return result;
    } catch (error: unknown) {
      // TooManyRequestsError is an AppError — let error handler deal with it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        request.log.warn(
          '[AUTH] Login RATE-LIMITED user="%s" ip=%s',
          username,
          ip,
        );
        throw error;
      }
      const msg = error instanceof Error ? error.message : 'Unknown error';
      request.log.warn(
        '[AUTH] Login FAILED user="%s" ip=%s reason="%s"',
        username,
        ip,
        msg,
      );
      recordLoginAttempt(username, ip, ua, origin, false, msg);
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }
  });

  app.post('/auth/refresh', async (request, reply) => {
    const body = request.body as { refreshToken?: string };
    if (!body?.refreshToken) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'refreshToken is required',
      });
    }

    try {
      const apiMotherAuth = ApiMotherAuthService.getInstance();
      const { accessToken, refreshToken: newRefresh } =
        await apiMotherAuth.refreshUserToken(body.refreshToken);
      return { token: accessToken, refreshToken: newRefresh, type: 'refresh' };
    } catch {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
    }
  });

  app.get('/auth/me', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Missing token' });
    }
    try {
      const token = authHeader.slice(7);
      const payload = verifyJwt(token, env.JWT_SECRET);
      if (!payload) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
      }
      const codusu = Number(payload.sub);
      if (!codusu || isNaN(codusu)) {
        return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid token' });
      }
      const me = await authService.getMe(codusu);
      return me;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid token';
      request.log.warn('[AUTH] /auth/me failed: %s', msg);
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: msg });
    }
  });

  app.post('/auth/login/colaborador', async (request, reply) => {
    const ip = request.ip;
    const ua = request.headers['user-agent'] ?? '';
    const origin = request.headers.origin ?? 'unknown';

    request.log.info(
      { origin, ip },
      '[AUTH] Colaborador login attempt from %s',
      ip,
    );

    let codparc: number;
    let cpf: string;
    let turnstileToken: string | undefined;
    try {
      const parsed = loginColaboradorSchema.parse(request.body);
      codparc = parsed.codparc;
      cpf = parsed.cpf;
      turnstileToken = parsed.turnstileToken;
    } catch (err) {
      request.log.warn(
        { ip, origin },
        '[AUTH] Colaborador login validation failed — invalid payload',
      );
      throw err;
    }

    const turnstileOk = await validateTurnstile(turnstileToken);
    if (!turnstileOk) {
      recordLoginAttempt(`colaborador:${codparc}`, ip, ua, origin, false, 'Turnstile verification failed');
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Verificacao humana falhou. Tente novamente.',
      });
    }

    const cpfMasked = cpf.substring(0, 3) + '***' + cpf.substring(cpf.length - 2);
    request.log.info(
      '[AUTH] Login colaborador codparc=%d cpf=%s ip=%s origin=%s',
      codparc,
      cpfMasked,
      ip,
      origin,
    );

    try {
      const result = await authService.loginColaborador(codparc, cpf, ip, ua);
      request.log.info(
        '[AUTH] Login SUCCESS colaborador codparc=%d ip=%s',
        codparc,
        ip,
      );
      recordLoginAttempt(`colaborador:${codparc}`, ip, ua, origin, true);
      return result;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        request.log.warn(
          '[AUTH] Login RATE-LIMITED colaborador codparc=%d ip=%s',
          codparc,
          ip,
        );
        throw error;
      }
      const msg = error instanceof Error ? error.message : 'Invalid colaborador credentials';
      request.log.warn(
        '[AUTH] Login FAILED colaborador codparc=%d ip=%s reason="%s"',
        codparc,
        ip,
        msg,
      );
      recordLoginAttempt(`colaborador:${codparc}`, ip, ua, origin, false, msg);
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: msg,
      });
    }
  });
}
