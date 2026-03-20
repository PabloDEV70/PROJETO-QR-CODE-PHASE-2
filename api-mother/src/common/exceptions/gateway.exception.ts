import { HttpException, HttpStatus } from '@nestjs/common';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';

/**
 * Typed base exception class for all gateway errors.
 * Carries a GatewayErrorCode, human-readable message, and optional context map.
 */
export class GatewayException extends HttpException {
  constructor(
    public readonly code: GatewayErrorCode,
    message: string,
    public readonly context: Record<string, unknown> = {},
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super({ code, message, context }, statusCode);
  }
}
