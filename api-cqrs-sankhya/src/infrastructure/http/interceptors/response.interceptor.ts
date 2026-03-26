import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const t0 = Date.now();

    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - t0;
        const database = request.user?.database ?? request.headers['x-database'] ?? 'TESTE';

        if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
          return {
            ...data,
            success: true,
            meta: { timestamp: new Date().toISOString(), database, duration_ms: duration },
          };
        }

        return {
          data,
          success: true,
          meta: { timestamp: new Date().toISOString(), database, duration_ms: duration },
        };
      }),
    );
  }
}
