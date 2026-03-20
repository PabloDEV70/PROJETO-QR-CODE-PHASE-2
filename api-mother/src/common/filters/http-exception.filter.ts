import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayException } from '../exceptions/gateway.exception';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';
import { mapLegacyCode, mapStatusCode } from './error-code-mapper';

/**
 * Exception filter for HttpException instances (including GatewayException).
 * Emits structured error envelope: { data, success, error: { code, message, context? }, meta }.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const { code, message, context } = this.resolve(exception, status);

    this.logger.error(
      `HTTP Exception: ${status} [${code}] ${message}`,
      exception.stack,
    );

    response.status(status).json({
      data: null,
      success: false,
      error: {
        code,
        message,
        ...(Object.keys(context).length > 0 ? { context } : {}),
      },
      meta: { timestamp: new Date().toISOString() },
    });
  }

  private resolve(
    exception: HttpException,
    status: number,
  ): { code: GatewayErrorCode; message: string; context: Record<string, unknown> } {
    // 1. GatewayException: code and context already typed
    if (exception instanceof GatewayException) {
      return { code: exception.code, message: exception.message, context: exception.context ?? {} };
    }

    const exceptionResponse = exception.getResponse();

    // 2. class-validator array
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      const msg = resp['message'];

      if (Array.isArray(msg) && msg.every((m) => typeof m === 'string')) {
        return {
          code: GatewayErrorCode.ERR_VALIDATION_FAILED,
          message: 'Validation failed.',
          context: { details: msg as string[] },
        };
      }

      // 3. Guard-embedded legacy code
      const rawCode = typeof resp['code'] === 'string' ? resp['code'] : null;
      if (rawCode) {
        const mapped = mapLegacyCode(rawCode);
        if (mapped) {
          const { code: _c, message: _m, ...rest } = resp;
          return {
            code: mapped,
            message: typeof _m === 'string' ? _m : exception.message,
            context: rest as Record<string, unknown>,
          };
        }
      }
    }

    // 4. HTTP status fallback
    const msgStr =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : String((exceptionResponse as Record<string, unknown>)['message'] ?? exception.message);

    return { code: mapStatusCode(status), message: msgStr, context: {} };
  }
}
