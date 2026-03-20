import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DatabaseContextService } from '../../database/database-context.service';
import { DatabaseKey, isValidDatabaseKey } from '../../config/database.config';

/**
 * Re-applies AsyncLocalStorage database context from the request object.
 * Fixes context loss that occurs between Express middleware and NestJS handlers
 * due to async boundaries (guards, pipes) breaking AsyncLocalStorage propagation.
 */
@Injectable()
export class DatabaseContextInterceptor implements NestInterceptor {
  constructor(private readonly databaseContext: DatabaseContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const databaseKey: string | undefined =
      request.databaseKey || request.get?.('X-Database');

    if (databaseKey && isValidDatabaseKey(databaseKey)) {
      const key = databaseKey.toUpperCase() as DatabaseKey;
      return new Observable((subscriber) => {
        this.databaseContext.run(key, () => {
          next.handle().subscribe({
            next: (val) => subscriber.next(val),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
