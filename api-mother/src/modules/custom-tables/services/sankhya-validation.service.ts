import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { CreateCustomTableDto } from '../dto/create-custom-table.dto';

/**
 * Service for validating Sankhya-specific business rules
 *
 * This service enforces critical Sankhya data dictionary constraints:
 * - NUINSTANCIA must be >= 9999990000 (custom tables range)
 * - NUCAMPO must be >= 9999990000 (custom fields range)
 * - Table names must not conflict with existing tables
 * - Instance numbers must be unique
 */
@Injectable()
export class SankhyaValidationService {
  private readonly logger = new Logger(SankhyaValidationService.name);

  // CRITICAL CONSTANTS - DO NOT MODIFY
  private readonly CUSTOM_INSTANCE_MIN = 9999990000;
  private readonly CUSTOM_FIELD_MIN = 9999990000;

  constructor(private readonly sqlService: SqlServerService) {}

  /**
   * Validate that table name does not already exist in TDDTAB
   */
  async validateTableDoesNotExist(tableName: string): Promise<void> {
    this.logger.log(`Validating table "${tableName}" does not exist...`);

    const checkSql = `
      SELECT COUNT(*) as count
      FROM TDDTAB
      WHERE NOMETAB = @param1
    `.trim();

    const result = await this.sqlService.executeSQL(checkSql, [tableName]);

    if (result[0]?.count > 0) {
      this.logger.error(`Table "${tableName}" already exists in TDDTAB`);
      throw new BadRequestException(
        `Table "${tableName}" already exists in Sankhya data dictionary. ` + 'Choose a different table name.',
      );
    }

    this.logger.log(`✅ Table "${tableName}" does not exist - validation passed`);
  }

  /**
   * Generate a unique NUINSTANCIA >= 9999990000
   */
  async generateUniqueInstanceNumber(): Promise<number> {
    this.logger.log('Generating unique NUINSTANCIA...');

    const maxSql = `
      SELECT ISNULL(MAX(NUINSTANCIA), 9999990000) as maxInstance
      FROM TDDINS
      WHERE NUINSTANCIA >= @param1
    `.trim();

    const result = await this.sqlService.executeSQL(maxSql, [this.CUSTOM_INSTANCE_MIN]);
    const newInstance = result[0].maxInstance + 1;

    // Safety check
    if (newInstance < this.CUSTOM_INSTANCE_MIN) {
      throw new BadRequestException('Failed to generate valid NUINSTANCIA. Database may be corrupted.');
    }

    this.logger.log(`✅ Generated NUINSTANCIA: ${newInstance}`);
    return newInstance;
  }

  /**
   * Generate unique NUCAMPO values for fields
   */
  async generateUniqueFieldNumbers(count: number): Promise<number[]> {
    this.logger.log(`Generating ${count} unique NUCAMPO values...`);

    const maxSql = `
      SELECT ISNULL(MAX(NUCAMPO), 9999990000) as maxField
      FROM TDDCAM
      WHERE NUCAMPO >= @param1
    `.trim();

    const result = await this.sqlService.executeSQL(maxSql, [this.CUSTOM_FIELD_MIN]);
    const nextField = result[0].maxField + 1;

    // Safety check
    if (nextField < this.CUSTOM_FIELD_MIN) {
      throw new BadRequestException('Failed to generate valid NUCAMPO. Database may be corrupted.');
    }

    const fieldNumbers: number[] = [];
    for (let i = 0; i < count; i++) {
      fieldNumbers.push(nextField + i);
    }

    this.logger.log(`✅ Generated NUCAMPO range: ${fieldNumbers[0]} to ${fieldNumbers[fieldNumbers.length - 1]}`);
    return fieldNumbers;
  }

  /**
   * Validate complete DTO against Sankhya rules
   */
  async validateCustomTable(dto: CreateCustomTableDto): Promise<string[]> {
    this.logger.log(`Validating custom table: ${dto.tableName}`);
    const warnings: string[] = [];

    // Validate primary key exists
    try {
      dto.validatePrimaryKey();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // Validate table name doesn't exist
    await this.validateTableDoesNotExist(dto.tableName);

    // Validate field data types have required parameters
    for (const field of dto.fields) {
      if ((field.dataType === 'VARCHAR' || field.dataType === 'NVARCHAR') && !field.length) {
        throw new BadRequestException(`Field "${field.name}" with type ${field.dataType} requires a length parameter`);
      }

      if (field.dataType === 'DECIMAL' && (!field.precision || field.scale === undefined)) {
        throw new BadRequestException(
          `Field "${field.name}" with type DECIMAL requires precision and scale parameters`,
        );
      }

      // Warn about nullable primary keys
      if (field.isPrimaryKey && field.nullable) {
        warnings.push(`Field "${field.name}" is primary key but marked as nullable - will be forced to NOT NULL`);
      }
    }

    // Warn if no description on fields
    const fieldsWithoutDesc = dto.fields.filter((f) => !f.description);
    if (fieldsWithoutDesc.length > 0) {
      warnings.push(`${fieldsWithoutDesc.length} field(s) have no description`);
    }

    this.logger.log(`✅ Validation passed for "${dto.tableName}"`);
    if (warnings.length > 0) {
      this.logger.warn(`Warnings: ${warnings.join(', ')}`);
    }

    return warnings;
  }
}
