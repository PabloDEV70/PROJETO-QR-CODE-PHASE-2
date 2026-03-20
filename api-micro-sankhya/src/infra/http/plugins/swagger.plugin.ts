import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from '@/config/env';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  if (env.NODE_ENV === 'production') return;

  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'API Sankhya Master',
        description: 'Gateway Read-Only for Sankhya Database via API Mother',
        version: '1.0.0',
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });
}
