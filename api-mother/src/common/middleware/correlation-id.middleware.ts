import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { trace } from '@opentelemetry/api';
import { requestContextStorage, RequestContext } from '../logging/correlation-id.context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      crypto.randomUUID();

    const context: RequestContext = {
      correlationId,
      database: req.headers['x-database'] as string | undefined,
      method: req.method,
      path: req.path,
      ip: req.ip,
    };

    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.setAttribute('correlation.id', correlationId);
    }

    requestContextStorage.run(context, () => {
      next();
    });
  }
}
