import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * CharTrimInterceptor — strips trailing spaces from SQL Server CHAR/NCHAR fields.
 *
 * Runs before GlobalResponseInterceptor wraps the envelope (LIFO order).
 * Recursively trims all string values in arrays and nested objects.
 */
@Injectable()
export class CharTrimInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.trimRecursive(data)));
  }

  private trimRecursive(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.trimRecursive(item));
    }

    if (data !== null && typeof data === 'object') {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(data as Record<string, unknown>)) {
        const value = (data as Record<string, unknown>)[key];
        if (typeof value === 'string') {
          result[key] = value.trim();
        } else {
          result[key] = this.trimRecursive(value);
        }
      }
      return result;
    }

    return data;
  }
}
