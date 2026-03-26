import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'ERR_INTERNAL';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as any).message ?? exception.message;
      code = status === 401 ? 'ERR_UNAUTHORIZED'
        : status === 403 ? 'ERR_FORBIDDEN'
        : status === 400 ? 'ERR_VALIDATION'
        : status === 404 ? 'ERR_NOT_FOUND'
        : status === 429 ? 'ERR_RATE_LIMIT'
        : 'ERR_HTTP';
    } else if (exception instanceof Error) {
      message = exception.message;
      if (message.startsWith('SECURITY:')) {
        status = 403;
        code = 'ERR_SECURITY';
      }
    }

    if (status >= 500) {
      this.logger.error(`${code}: ${message}`, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(`${code}: ${message}`);
    }

    response.status(status).json({
      data: null,
      success: false,
      error: { code, message },
      meta: { timestamp: new Date().toISOString() },
    });
  }
}
