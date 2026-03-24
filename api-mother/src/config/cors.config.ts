import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

/**
 * Configuração CORS centralizada.
 *
 * IMPORTANTE: Durante desenvolvimento, CORS está aberto (origin: true).
 * Para produção, configure CORS_ORIGINS com lista de domínios permitidos.
 *
 * @example
 * # .env para produção
 * CORS_ORIGINS=https://app.empresa.com,https://admin.empresa.com
 */
export function getCorsConfig(configService: ConfigService): CorsOptions {
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  let origin: CorsOptions['origin'];
  const isProduction = nodeEnv === 'production';

  if (corsOrigins && corsOrigins !== '*') {
    const allowedOrigins = corsOrigins.split(',').map((o) => o.trim());
    origin = (requestOrigin, callback) => {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
      }
    };
  } else if (isProduction) {
    // Block open CORS in production when CORS_ORIGINS is not configured
    origin = false;
  } else {
    origin = true;
  }

  return {
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'X-Total-Count',
      'X-Page-Count',
      'X-Current-Page',
      'X-Per-Page',
      'X-Database',
      'Content-Disposition',
      'Cache-Control',
      'Pragma',
      'If-None-Match',
      'If-Modified-Since',
    ],
    exposedHeaders: [
      'Content-Disposition',
      'X-Total-Count',
      'X-Page-Count',
      'X-Current-Page',
      'X-Per-Page',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
}

/**
 * Headers expostos relacionados a rate limiting.
 * Estes headers informam ao cliente sobre limites de requisição.
 */
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
};
