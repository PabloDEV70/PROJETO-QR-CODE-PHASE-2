import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StructuredLogger } from '../logging/structured-logger.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLogger) {}

  // Endpoints de health check que não devem gerar logs
  private readonly HEALTH_CHECK_ENDPOINTS = ['/', '/version', '/health', '/favicon.ico', '/api/health'];

  // Threshold em ms para logar requisições lentas
  private readonly SLOW_REQUEST_THRESHOLD = 1000;

  private isHealthCheck(url: string): boolean {
    return this.HEALTH_CHECK_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(endpoint + '?'));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Skip health check endpoints entirely
    if (this.isHealthCheck(request.url)) {
      return next.handle();
    }

    const isDebugMode = process.env.LOG_LEVEL === 'debug';

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - now;
        const statusCode = response.statusCode;

        // Only log in these cases:
        // 1. Debug mode is enabled
        // 2. Request is slow (> threshold)
        // 3. Response is an error (>= 400)
        const shouldLog = isDebugMode || durationMs > this.SLOW_REQUEST_THRESHOLD || statusCode >= 400;

        if (shouldLog) {
          if (statusCode >= 400) {
            this.logger.error(`Request failed`, undefined, {
              method: request.method,
              url: request.url,
              statusCode,
              durationMs,
            });
          } else if (durationMs > this.SLOW_REQUEST_THRESHOLD) {
            this.logger.warn('Slow request detected', {
              method: request.method,
              url: request.url,
              statusCode,
              durationMs,
            });
          } else {
            this.logger.info('Request completed', {
              method: request.method,
              url: request.url,
              statusCode,
              durationMs,
            });
          }
        }
      }),
    );
  }
}
