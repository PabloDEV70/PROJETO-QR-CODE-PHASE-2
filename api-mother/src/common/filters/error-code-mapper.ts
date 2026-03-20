import { HttpStatus } from '@nestjs/common';
import { GatewayErrorCode } from '../enums/gateway-error-code.enum';

/**
 * Maps legacy guard error codes (string literals) to GatewayErrorCode constants.
 * Returns null when the raw code is unrecognised (caller falls through to HTTP-status mapping).
 */
export function mapLegacyCode(raw: string): GatewayErrorCode | null {
  const map: Record<string, GatewayErrorCode> = {
    DATABASE_WRITE_BLOCKED: GatewayErrorCode.ERR_WRITE_FORBIDDEN,
    TABLE_WRITE_NOT_ALLOWED: GatewayErrorCode.ERR_TABLE_WRITE_NOT_ALLOWED,
    TABLE_NAME_EXTRACTION_FAILED: GatewayErrorCode.ERR_TABLE_EXTRACTION_FAILED,
    BOSS_APPROVAL_REQUIRED: GatewayErrorCode.ERR_BOSS_APPROVAL_REQUIRED,
    PROTECTED_TABLE: GatewayErrorCode.ERR_TABLE_PROTECTED,
    MUTATION_DISABLED: GatewayErrorCode.ERR_MUTATION_DISABLED,
    // Already-ERR_ prefixed codes pass through directly
    ERR_RATE_LIMIT: GatewayErrorCode.ERR_RATE_LIMIT,
    ERR_ADMIN_REQUIRED: GatewayErrorCode.ERR_ADMIN_REQUIRED,
    ERR_UNAUTHORIZED: GatewayErrorCode.ERR_UNAUTHORIZED,
  };
  return map[raw] ?? null;
}

/**
 * Maps HTTP status codes to the nearest GatewayErrorCode.
 */
export function mapStatusCode(status: number): GatewayErrorCode {
  if (status === HttpStatus.UNAUTHORIZED) return GatewayErrorCode.ERR_UNAUTHORIZED;
  if (status === HttpStatus.TOO_MANY_REQUESTS) return GatewayErrorCode.ERR_RATE_LIMIT;
  if (status === HttpStatus.BAD_REQUEST) return GatewayErrorCode.ERR_VALIDATION_FAILED;
  if (status === HttpStatus.FORBIDDEN) return GatewayErrorCode.ERR_WRITE_FORBIDDEN;
  return GatewayErrorCode.ERR_INTERNAL;
}
