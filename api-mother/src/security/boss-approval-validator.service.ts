import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GatewayErrorCode } from '../common/enums/gateway-error-code.enum';

/**
 * Claims structure for boss approval JWT tokens.
 * The token must be signed with the gateway JWT secret and carry the approvals array.
 */
export interface BossApprovalClaims {
  sub: string;
  username: string;
  approvals: string[];
  exp: number;
  iat: number;
}

/**
 * Validates boss approval tokens for PROD write operations.
 *
 * Performs full JWT validation:
 * - Signature verification (via JwtService.verify)
 * - Expiry check (via JwtService.verify — throws on expired token)
 * - Claims validation (approvals must be a non-empty array)
 *
 * @throws ForbiddenException with code ERR_BOSS_TOKEN_INVALID on any failure
 */
@Injectable()
export class BossApprovalValidator {
  private readonly logger = new Logger(BossApprovalValidator.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validate boss approval token. Throws on any failure.
   *
   * @param token - Raw JWT string from x-boss-approval header
   * @returns Decoded and validated BossApprovalClaims
   * @throws ForbiddenException with ERR_BOSS_TOKEN_INVALID on invalid token
   */
  validateApprovalToken(token: string): BossApprovalClaims {
    let claims: BossApprovalClaims;

    try {
      // JwtService.verify() validates signature AND expiry
      // Throws JsonWebTokenError (invalid) or TokenExpiredError (expired)
      claims = this.jwtService.verify<BossApprovalClaims>(token);
    } catch (error) {
      // Re-throw ForbiddenException as-is (should not happen here, but guard against it)
      if (error instanceof ForbiddenException) {
        throw error;
      }

      const reason = (error as Error).message || 'unknown JWT error';
      this.logger.warn(`Boss approval token rejected: ${reason}`);

      throw new ForbiddenException({
        code: GatewayErrorCode.ERR_BOSS_TOKEN_INVALID,
        message: 'Boss approval token is invalid or expired',
        reason,
      });
    }

    // Validate approvals claim: must be a non-null, non-empty array
    if (!Array.isArray(claims.approvals) || claims.approvals.length === 0) {
      this.logger.warn(
        `Boss approval token missing or empty approvals claim for sub=${claims.sub ?? 'unknown'}`,
      );

      throw new ForbiddenException({
        code: GatewayErrorCode.ERR_BOSS_TOKEN_INVALID,
        message: 'Boss approval token must contain a non-empty approvals claim',
      });
    }

    this.logger.debug(
      `Boss approval token valid: sub=${claims.sub}, approvals=[${claims.approvals.join(', ')}]`,
    );

    return claims;
  }
}
