import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_ENVELOPE_KEY } from '../decorators/skip-envelope.decorator';
import { ApiEnvelope } from '../schemas/envelope.schema';

/**
 * Global response interceptor — wraps every HTTP response in { data, success, meta }.
 *
 * Skip with @SkipEnvelope() on the handler or controller class.
 *
 * Controllers may return a tagged object { __payload, __meta } to populate meta fields:
 *   return { __payload: rows, __meta: { rows: rows.length, executionTimeMs: elapsed } };
 * The interceptor strips __payload/__meta and promotes them to the envelope fields.
 *
 * MUST be registered via APP_INTERCEPTOR in AppModule (not useGlobalInterceptors in main.ts)
 * so that Reflector is injectable.
 */
@Injectable()
export class GlobalResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiEnvelope<T>> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ENVELOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle() as Observable<ApiEnvelope<T>>;
    }

    return next.handle().pipe(
      map((payload) => {
        if (
          payload !== null &&
          payload !== undefined &&
          typeof payload === 'object' &&
          '__payload' in (payload as object)
        ) {
          const tagged = payload as { __payload: T; __meta?: Record<string, unknown> };
          return {
            data: tagged.__payload,
            success: true,
            meta: tagged.__meta ?? {},
          };
        }

        return {
          data: (payload ?? null) as T,
          success: true,
          meta: {},
        };
      }),
    );
  }
}
