import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3028),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // SQL Server (read-only)
  SQLSERVER_HOST: z.string().default('192.168.1.6'),
  SQLSERVER_PORT: z.coerce.number().default(1433),
  SQLSERVER_USER: z.string().default('sankhya'),
  SQLSERVER_PASSWORD: z.string(),
  SQLSERVER_ENCRYPT: z.string().default('false').transform((v) => v === 'true'),
  SQLSERVER_TRUST_CERT: z.string().default('true').transform((v) => v === 'true'),
  SQLSERVER_POOL_MIN: z.coerce.number().default(2),
  SQLSERVER_POOL_MAX: z.coerce.number().default(10),

  // JWT (compativel com api-mother)
  JWT_SECRET: z.string(),

  // API Tokens (csv: app_name:token,app_name2:token2)
  API_TOKENS: z.string().default(''),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(200),

  // CORS
  CORS_ORIGINS: z.string().default('*'),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env;

export function loadEnv(): Env {
  if (_env) return _env;
  _env = envSchema.parse(process.env);
  return _env;
}

export function getEnv(): Env {
  if (!_env) throw new Error('Env not loaded. Call loadEnv() first.');
  return _env;
}
