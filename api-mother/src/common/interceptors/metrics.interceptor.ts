import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricsService } from '../../modules/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private static readonly SKIP_ROUTES = new Set([
    '/health',
    '/metrics',
    '/readiness',
    '/favicon.ico',
  ]);

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const route: string = req.route?.path ?? req.path ?? 'unknown';

    if (MetricsInterceptor.SKIP_ROUTES.has(route)) {
      return next.handle();
    }

    const method: string = req.method;
    const startMs = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startMs;
        const resolvedRoute: string = req.route?.path ?? route;
        this.metricsService.recordRequest(method, resolvedRoute, res.statusCode, durationMs);
      }),
      catchError((error: any) => {
        const durationMs = Date.now() - startMs;
        const resolvedRoute: string = req.route?.path ?? route;
        const statusCode: number = error?.status ?? error?.statusCode ?? 500;
        const errorCode: string =
          error?.code ?? error?.response?.error ?? String(statusCode);

        this.metricsService.recordRequest(method, resolvedRoute, statusCode, durationMs);
        this.metricsService.recordError(method, resolvedRoute, errorCode);
        throw error;
      }),
    );
  }
}
