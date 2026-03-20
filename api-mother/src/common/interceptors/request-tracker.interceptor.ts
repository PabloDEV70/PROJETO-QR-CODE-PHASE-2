import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class RequestTrackerInterceptor implements NestInterceptor {
  static activeRequests = 0;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    RequestTrackerInterceptor.activeRequests++;
    return next.handle().pipe(
      finalize(() => {
        RequestTrackerInterceptor.activeRequests--;
      }),
    );
  }
}
