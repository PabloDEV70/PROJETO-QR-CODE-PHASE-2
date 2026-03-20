import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from '@/config/env';

export async function registerCors(app: FastifyInstance): Promise<void> {
  const configuredOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [];
  const allowedOrigins = env.NODE_ENV === 'production'
    ? [...configuredOrigins, 'https://publico.gigantao.net']
    : true;

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Database-Selection'],
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
  });
}
