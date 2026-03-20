import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { StructuredLogger } from '../logging/structured-logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: StructuredLogger) {}

  // Endpoints de health check que não devem gerar logs
  private readonly HEALTH_CHECK_ENDPOINTS = ['/', '/version', '/health', '/favicon.ico', '/api/health'];

  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (_error) {
      return null;
    }
  }

  private isHealthCheck(url: string): boolean {
    return this.HEALTH_CHECK_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(endpoint + '?'));
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const logger = this.logger;

    // Skip logging for health check endpoints
    if (this.isHealthCheck(req.url)) {
      return next();
    }

    // Extract username from JWT token
    let username = 'anonymous';
    let userId: string | undefined;

    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = this.decodeJwtPayload(token);
        if (decoded && decoded.username) {
          username = decoded.username;
          userId = decoded.sub ? String(decoded.sub) : undefined;
        }
      }
    } catch (_error) {
      // Silently ignore JWT decode errors - user is anonymous
    }

    // Only log request in debug mode or for non-GET methods
    const isDebugMode = process.env.LOG_LEVEL === 'debug';
    const isWriteOperation = req.method !== 'GET' && req.method !== 'HEAD';

    if (isDebugMode || isWriteOperation) {
      logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
        username,
        userId,
      });
    }

    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
      const durationMs = Date.now() - startTime;

      // Only log response on errors or in debug mode
      if (res.statusCode >= 400) {
        logger.error(`HTTP ${res.statusCode} on ${req.method} ${req.url}`, undefined, {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          durationMs,
          username,
          userId,
        });
      } else if (isDebugMode || isWriteOperation) {
        logger.info('Request completed', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          durationMs,
          username,
          userId,
        });
      }

      return originalSend(body);
    };

    next();
  }
}
