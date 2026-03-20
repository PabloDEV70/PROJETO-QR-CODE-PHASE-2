import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CustomTablesService } from '../services/custom-tables.service';
import { CreateCustomTableDto } from '../dto/create-custom-table.dto';
import { TestOnlyGuard } from '../guards/test-only.guard';

/**
 * Controller for Custom Tables creation in Sankhya
 *
 * SECURITY:
 * - Protected by TestOnlyGuard (TESTE database only)
 * - PROD and TREINA databases are BLOCKED
 * - All operations logged for audit
 */
@ApiTags('Custom Tables (DANGEROUS - TESTE ONLY)')
@Controller('custom-tables')
@UseGuards(TestOnlyGuard) // CRITICAL: Only TESTE database allowed
export class CustomTablesController {
  private readonly logger = new Logger(CustomTablesController.name);

  constructor(private readonly customTablesService: CustomTablesService) {}

  @Post()
  @ApiOperation({
    summary: '[DANGEROUS] Create Custom Sankhya Table',
    description: `
      Creates a custom table in Sankhya's data dictionary (TDD* tables).

      ⚠️ CRITICAL SAFETY RULES:
      - ONLY works on TESTE database (Header: X-Database: TESTE)
      - PROD and TREINA are PERMANENTLY BLOCKED
      - Always run with dryRun=true first
      - Table name must start with AD_
      - Maximum 15 characters
      - Must have at least one primary key

      PROCESS:
      1. Validates table definition
      2. Generates NUINSTANCIA and NUCAMPO values
      3. Creates entries in TDDTAB, TDDINS, TDDCAM, TDDPCO
      4. Creates physical table
      5. All in a transaction (auto-rollback on error)

      RECOMMENDED WORKFLOW:
      1. First call with dryRun=true to validate
      2. Review generated SQLs
      3. Then call with dryRun=false to execute
    `,
  })
  @ApiBody({ type: CreateCustomTableDto })
  @ApiResponse({
    status: 201,
    description: 'Table created successfully (or dry-run completed)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        tableName: { type: 'string' },
        nuinstancia: { type: 'number' },
        generatedSQLs: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or table already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'BLOCKED: Attempted to use PROD or TREINA database',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error (transaction rolled back)',
  })
  async createTable(@Body() dto: CreateCustomTableDto) {
    this.logger.warn('=================================================');
    this.logger.warn(`CUSTOM TABLE CREATION REQUEST: ${dto.tableName}`);
    this.logger.warn(`DRY-RUN: ${dto.dryRun ? 'YES' : 'NO'}`);
    this.logger.warn('=================================================');

    const result = await this.customTablesService.createCustomTable(dto);

    this.logger.warn('=================================================');
    this.logger.warn(`RESULT: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    this.logger.warn('=================================================');

    return result;
  }
}
