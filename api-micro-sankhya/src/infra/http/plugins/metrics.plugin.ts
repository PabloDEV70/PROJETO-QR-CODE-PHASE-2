import { FastifyInstance } from 'fastify';
import metricsPlugin from 'fastify-metrics';

export async function registerMetrics(app: FastifyInstance): Promise<void> {
  await app.register(metricsPlugin, {
    endpoint: '/metrics',
    defaultMetrics: { enabled: true },
    routeMetrics: { enabled: true },
  });
}
