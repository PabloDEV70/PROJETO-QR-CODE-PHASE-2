import { Module } from '@nestjs/common';
import { CustomTablesController } from './controllers/custom-tables.controller';
import { CustomTablesService } from './services/custom-tables.service';
import { SankhyaValidationService } from './services/sankhya-validation.service';
import { TestOnlyGuard } from './guards/test-only.guard';
import { DatabaseModule } from '../../database/database.module';

/**
 * Custom Tables Module
 *
 * This module provides functionality to create custom tables in Sankhya's
 * data dictionary (TDD* tables).
 *
 * SECURITY:
 * - Protected by TestOnlyGuard
 * - Only TESTE database allowed
 * - PROD and TREINA permanently blocked
 *
 * USAGE:
 * Import this module in app.module.ts to enable custom table creation endpoints.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [
    CustomTablesController,
    // DebugDatabaseController removed - use direct SQL queries instead
  ],
  providers: [CustomTablesService, SankhyaValidationService, TestOnlyGuard],
  exports: [CustomTablesService], // Export if other modules need it
})
export class CustomTablesModule {}
