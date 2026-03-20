import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@/domain/errors';
import { TooManyRequestsError } from '@/domain/errors/app-error';
import { ZodError } from 'zod';
import { env } from '@/config/env';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    if (error instanceof TooManyRequestsError) {
      reply.header('Retry-After', String(error.retryAfterSeconds));
    }
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  // Zod v4 (classic mode) — still uses `issues` array
  if (error instanceof ZodError || error.name === 'ZodError') {
    const zodErr = error as unknown as ZodError;
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request parameters',
      details: zodErr.issues ?? error.message,
    });
  }

  // Build request context for all error logs
  const reqCtx = {
    method: request.method,
    url: request.url,
    route: request.routeOptions?.url,
    query: request.query,
    ip: request.ip,
    db: request.headers['x-database-selection'],
  };

  // Axios errors from API Mother
  const axiosErr = error as any;
  if (axiosErr.isAxiosError || axiosErr?.response?.status) {
    const status = axiosErr.response?.status ?? 502;
    const motherData = axiosErr.response?.data;
    const rawDetail = motherData?.message ?? motherData?.error ?? axiosErr.message;
    const detail = typeof rawDetail === 'object' && rawDetail !== null
      ? (rawDetail.message ?? rawDetail.code ?? JSON.stringify(rawDetail))
      : rawDetail;
    const motherUrl = axiosErr.config?.url;
    const motherMethod = axiosErr.config?.method?.toUpperCase();
    request.log.error(
      { ...reqCtx, motherStatus: status, motherUrl, motherMethod, detail, motherData },
      `[ErrorHandler] API Mother ${status} on ${motherMethod} ${motherUrl}`,
    );

    // Propagate auth errors so frontend can logout
    if (status === 401) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: typeof detail === 'string' ? detail : 'Token invalido ou expirado',
      });
    }

    if (status === 403) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: typeof detail === 'string' ? detail : 'Sem permissao para este recurso',
      });
    }

    const body: Record<string, unknown> = {
      statusCode: 502,
      error: 'Bad Gateway',
      message: typeof detail === 'string' ? detail : 'Erro na comunicacao com API Mother',
    };
    if (env.NODE_ENV !== 'production') {
      body.motherStatus = status;
      body.motherUrl = motherUrl;
      body.motherData = motherData;
    }
    return reply.status(502).send(body);
  }

  // Unknown errors
  const errMsg = error instanceof Error ? error.message : String(error);
  const errStack = error instanceof Error ? error.stack : undefined;
  request.log.error(
    { ...reqCtx, errMsg, errStack, errName: (error as any)?.name },
    `[ErrorHandler] Unhandled ${(error as any)?.name ?? 'Error'}: ${errMsg}`,
  );
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : (errMsg || 'An unexpected error occurred'),
  });
}
