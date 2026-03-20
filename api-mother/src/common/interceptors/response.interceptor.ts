import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Only wrap if it's not a streaming response or already wrapped
        if (context.getType() === 'http' && data !== undefined && data !== null && !data.statusCode) {
          return { data };
        }
        return data;
      }),
    );
  }
}
