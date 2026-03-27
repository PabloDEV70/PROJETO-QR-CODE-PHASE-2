import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file — works from both src/ (dev) and dist/src/ (prod)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),

  // API Mother Configuration
  API_MAE_BASE_URL: z.string().url(),
  API_MAE_RETRY_ATTEMPTS: z.string().transform(Number).default(3),

  // API key for public-query endpoint (public data without JWT)
  API_MOTHER_PUBLIC_KEY: z.string().optional().refine(
    (val) => process.env.NODE_ENV !== 'production' || !!val,
    { message: 'API_MOTHER_PUBLIC_KEY is required in production' },
  ),

  // Sankhya MGE Server (for file download URLs)
  SANKHYA_MGE_URL: z.string().url().optional(),

  // CORS: comma-separated origins (empty = allow all in dev)
  CORS_ORIGIN: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Security: Rate Limiting
  RATE_LIMIT_MAX_ATTEMPTS: z.string().transform(Number).default(5),
  RATE_LIMIT_WINDOW_MINUTES: z.string().transform(Number).default(15),

  // Redis (optional — enables online users tracking + request feed)
  REDIS_URL: z.string().optional(),

  // Cloudflare Turnstile (optional — bot protection on login)
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
