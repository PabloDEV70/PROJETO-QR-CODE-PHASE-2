import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import { createFastifyInstance } from './infra/http/fastify';
import { registerCors } from '@/infra/http/plugins/cors.plugin';
import { registerContext } from '@/infra/http/plugins/context.plugin';
import { registerRequestLogger } from '@/infra/http/plugins/request-logger.plugin';
import { registerSwagger } from '@/infra/http/plugins/swagger.plugin';
import { errorHandler } from '@/infra/http/plugins/error-handler';
import { authGuard } from '@/infra/http/plugins/auth-guard';
import { publicOriginGuard } from '@/infra/http/plugins/public-origin-guard';
import { cleanup as cleanupRateLimiter } from '@/domain/services/rate-limiter.service';
import { registerMetrics } from '@/infra/http/plugins/metrics.plugin';
import { routePlugins } from '@/infra/http/routes/registry';

export async function buildApp(): Promise<FastifyInstance> {
  const app = createFastifyInstance();

  // Cleanup expired rate-limit entries every 60s
  const rateLimitTimer = setInterval(cleanupRateLimiter, 60_000);
  app.addHook('onClose', () => clearInterval(rateLimitTimer));

  // Prometheus metrics (before auth so /metrics is accessible)
  await registerMetrics(app);

  // Plugins
  await registerCors(app);
  await app.register(helmet, {
    global: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  });

  // Request context: database selection + user token via AsyncLocalStorage
  await registerContext(app);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Request/Response logging with timing
  await registerRequestLogger(app);

  // Public origin guard — MUST run BEFORE auth guard
  app.addHook('onRequest', publicOriginGuard);

  // Auth guard
  app.addHook('onRequest', authGuard);

  // Swagger (disabled in production)
  await registerSwagger(app);

  // Routes
  for (const plugin of routePlugins) {
    await app.register(plugin);
  }

  return app;
}
