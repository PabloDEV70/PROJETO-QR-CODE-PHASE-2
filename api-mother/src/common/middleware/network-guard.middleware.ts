import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_IP_PATTERNS = [
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^127\./,
  /^::1$/,
  /^::ffff:192\.168\./,
  /^::ffff:10\./,
  /^::ffff:127\./,
  /^::ffff:172\.(1[6-9]|2\d|3[01])\./,
];

const ALLOWED_ORIGIN_PATTERNS = [
  /\.gigantao\.net(:\d+)?$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
];

function isAllowedIp(ip: string | undefined): boolean {
  if (!ip) return false;
  return ALLOWED_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Server-to-server sem Origin e permitido (validado por IP)
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

function extractClientIp(req: Request): string {
  // Cloudflare Tunnel envia o IP real neste header
  const cfIp = req.headers['cf-connecting-ip'] as string | undefined;
  if (cfIp) return cfIp;

  const forwarded = req.headers['x-forwarded-for'] as string | undefined;
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = req.headers['x-real-ip'] as string | undefined;
  if (realIp) return realIp;

  return req.ip || req.socket.remoteAddress || '';
}

@Injectable()
export class NetworkGuardMiddleware implements NestMiddleware {
  private readonly logger = new Logger('NetworkGuard');

  use(req: Request, _res: Response, next: NextFunction) {
    // Bypass for trusted services with valid key (read at request time, after dotenv loads)
    const bypassKey = req.headers['x-network-bypass-key'] as string | undefined;
    const networkBypassKey = process.env.NETWORK_BYPASS_KEY || '';
    if (networkBypassKey && bypassKey === networkBypassKey) {
      return next();
    }

    const clientIp = extractClientIp(req);
    const origin = req.headers.origin as string | undefined;

    // Verificar IP
    if (!isAllowedIp(clientIp)) {
      this.logger.warn(`Blocked request from external IP: ${clientIp} ${req.method} ${req.path}`);
      throw new ForbiddenException('Access denied');
    }

    // Verificar Origin (se presente)
    if (origin && !isAllowedOrigin(origin)) {
      this.logger.warn(`Blocked request from external origin: ${origin} IP: ${clientIp} ${req.method} ${req.path}`);
      throw new ForbiddenException('Access denied');
    }

    next();
  }
}
