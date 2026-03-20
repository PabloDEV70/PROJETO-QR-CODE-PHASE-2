import { Module } from '@nestjs/common';
import { AuthModule } from '../modules/auth/auth.module';
import { DatabaseWriteGuard } from './database-write.guard';
import { SqlValidationService } from './sql-validation.service';
import { AuditService } from './audit.service';
import { TablePermissionService } from './table-permission.service';
import { TableWritePermissionGuard } from './table-write-permission.guard';
import { BossApprovalValidator } from './boss-approval-validator.service';

/**
 * Security Module - Provides comprehensive security services for the API
 *
 * Exports:
 * - DatabaseWriteGuard: Guards against unauthorized write operations by environment
 * - TableWritePermissionGuard: Guards against unauthorized writes to specific tables
 * - TablePermissionService: Manages table-level write permissions
 * - SqlValidationService: Validates SQL statements against security policies
 * - AuditService: Logs all database operations for compliance and security
 * - BossApprovalValidator: Full JWT validation for boss approval tokens
 */
@Module({
  imports: [AuthModule],
  providers: [
    BossApprovalValidator,
    DatabaseWriteGuard,
    TablePermissionService,
    TableWritePermissionGuard,
    SqlValidationService,
    AuditService,
  ],
  exports: [
    BossApprovalValidator,
    DatabaseWriteGuard,
    TablePermissionService,
    TableWritePermissionGuard,
    SqlValidationService,
    AuditService,
  ],
})
export class SecurityModule {}
