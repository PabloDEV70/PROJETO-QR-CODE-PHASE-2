import { HttpStatus } from '@nestjs/common';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';
import { GatewayException } from './gateway.exception';

/**
 * Typed exception for authentication and authorization errors.
 * Extends GatewayException to embed a GatewayErrorCode in the payload.
 * Factory methods preserve the original call-site API.
 */
export class AuthException extends GatewayException {
  constructor(
    message: string = 'Falha na autenticação',
    code: GatewayErrorCode = GatewayErrorCode.ERR_UNAUTHORIZED,
    statusCode: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super(code, message, {}, statusCode);
  }

  /** Credenciais inválidas (usuário/senha incorretos). */
  static invalidCredentials(message?: string): AuthException {
    return new AuthException(
      message || 'Usuário ou senha inválidos',
      GatewayErrorCode.ERR_INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** Token JWT expirado. */
  static tokenExpired(message?: string): AuthException {
    return new AuthException(
      message || 'Token de autenticação expirado',
      GatewayErrorCode.ERR_TOKEN_EXPIRED,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** Token JWT inválido ou malformado. */
  static invalidToken(message?: string): AuthException {
    return new AuthException(
      message || 'Token de autenticação inválido',
      GatewayErrorCode.ERR_UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** Acesso não autorizado (falta de permissões). */
  static unauthorized(message?: string): AuthException {
    return new AuthException(
      message || 'Acesso não autorizado',
      GatewayErrorCode.ERR_UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
    );
  }
}
