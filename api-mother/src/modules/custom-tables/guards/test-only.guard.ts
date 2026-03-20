import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { DatabaseContextService } from '../../../database/database-context.service';

/**
 * CRITICAL SAFETY GUARD
 *
 * This guard BLOCKS all custom table operations on PROD and TREINA databases.
 * ONLY TESTE database is allowed for custom table creation/modification.
 *
 * This is a HARDCODED safety measure to prevent accidental damage to:
 * - Production database (PROD / sankhya_prod)
 * - Training database (TREINA / sankhya_treina)
 *
 * SECURITY RULES:
 * ✅ TESTE (sankhya_teste) → ALLOWED
 * ❌ TREINA (sankhya_treina) → BLOCKED
 * ❌ PROD (sankhya_prod) → BLOCKED
 * ❌ Any other database → BLOCKED
 */
@Injectable()
export class TestOnlyGuard implements CanActivate {
  private readonly logger = new Logger(TestOnlyGuard.name);

  // HARDCODED ALLOWED DATABASE - DO NOT CHANGE
  private readonly ALLOWED_DATABASE = 'TESTE';

  // HARDCODED BLOCKED DATABASES - DO NOT REMOVE
  private readonly BLOCKED_DATABASES = ['PROD', 'TREINA'];

  constructor(private databaseContext: DatabaseContextService) {}

  canActivate(_context: ExecutionContext): boolean {
    const currentDatabase = this.databaseContext.getCurrentDatabase();

    // Log every access attempt for audit trail
    this.logger.warn(`Custom tables access attempt on database: ${currentDatabase}`);

    // CRITICAL CHECK: Block PROD at all costs
    if (currentDatabase === 'PROD') {
      this.logger.error(`BLOCKED: Attempt to create custom table on PROD database!`);
      throw new ForbiddenException(
        'PROD database is PERMANENTLY BLOCKED for custom table operations. ' +
          'This is a critical safety measure to protect production data. ' +
          'Use TESTE database only.',
      );
    }

    // CRITICAL CHECK: Block TREINA
    if (currentDatabase === 'TREINA') {
      this.logger.error(`BLOCKED: Attempt to create custom table on TREINA database!`);
      throw new ForbiddenException(
        'TREINA database is BLOCKED for custom table operations. ' +
          'Use TESTE database only for development and testing.',
      );
    }

    // SAFETY CHECK: Only allow TESTE
    if (currentDatabase !== 'TESTE') {
      this.logger.error(`BLOCKED: Unknown database "${currentDatabase}" attempted. Only TESTE is allowed.`);
      throw new ForbiddenException(
        `Database "${currentDatabase}" is not allowed for custom table operations. ` +
          'ONLY TESTE database is permitted for safety reasons.',
      );
    }

    // All checks passed - TESTE database confirmed
    this.logger.log(`✅ ALLOWED: Custom table operation on TESTE database`);
    return true;
  }
}
