import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  Matches,
  Length,
  ValidateNested,
  IsIn,
  ArrayMinSize,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ParameterizedSqlStatement } from '../../../database/sqlserver.service'; // Import ParameterizedSqlStatement

/**
 * DTO for defining a field/column in a custom Sankhya table
 */
export class CustomTableFieldDto {
  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'Field name must start with uppercase letter and contain only uppercase letters, numbers and underscores',
  })
  name: string;

  @IsString()
  @IsIn(['INT', 'VARCHAR', 'NVARCHAR', 'DECIMAL', 'DATETIME', 'BIT', 'TEXT'], {
    message: 'Invalid SQL Server data type. Allowed: INT, VARCHAR, NVARCHAR, DECIMAL, DATETIME, BIT, TEXT',
  })
  dataType: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  length?: number; // For VARCHAR/NVARCHAR

  @IsOptional()
  @IsInt()
  @Min(0)
  precision?: number; // For DECIMAL

  @IsOptional()
  @IsInt()
  @Min(0)
  scale?: number; // For DECIMAL

  @IsBoolean()
  nullable: boolean;

  @IsBoolean()
  isPrimaryKey: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  description?: string;
}

/**
 * DTO for creating a custom Sankhya table
 *
 * SECURITY RULES:
 * - Table name must start with "AD_" prefix (custom tables only)
 * - Table name must be <= 15 characters (Sankhya standard)
 * - All table/field names must be uppercase
 * - Must have at least one primary key field
 */
export class CreateCustomTableDto {
  @IsString()
  @Length(4, 15, {
    message: 'Table name must be between 4 and 15 characters (including AD_ prefix)',
  })
  @Matches(/^AD_[A-Z0-9_]{1,12}$/, {
    message:
      'Table name must start with AD_ followed by uppercase letters, numbers, or underscores (max 15 chars total)',
  })
  tableName: string;

  @IsString()
  @Length(1, 255)
  description: string;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'Table must have at least one field',
  })
  @ValidateNested({ each: true })
  @Type(() => CustomTableFieldDto)
  fields: CustomTableFieldDto[];

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  // Validation method to ensure at least one primary key
  validatePrimaryKey(): boolean {
    const hasPrimaryKey = this.fields.some((field) => field.isPrimaryKey);
    if (!hasPrimaryKey) {
      throw new Error('Table must have at least one primary key field');
    }
    return true;
  }
}

/**
 * DTO for dry-run response
 */
export class DryRunResponseDto {
  success: boolean;
  message: string;
  tableName: string;
  generatedSQLs: ParameterizedSqlStatement[]; // Changed from string[] to ParameterizedSqlStatement[]
  validationErrors?: string[];
  warnings?: string[];
}
