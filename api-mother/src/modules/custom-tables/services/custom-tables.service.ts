import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { SqlServerService, ParameterizedSqlStatement } from '../../../database/sqlserver.service'; // Import ParameterizedSqlStatement
import { SankhyaValidationService } from './sankhya-validation.service';
import { CreateCustomTableDto, CustomTableFieldDto, DryRunResponseDto } from '../dto/create-custom-table.dto';

/**
 * CRITICAL SERVICE - Custom Tables Creation
 *
 * This service generates and executes SQL statements to create custom tables
 * in Sankhya's data dictionary (TDD* tables).
 *
 * SAFETY MEASURES:
 * - All operations wrapped in transactions (BEGIN/COMMIT/ROLLBACK)
 * - Dry-run mode for validation without execution
 * - Extensive logging for audit trail
 * - Validation before any database modification
 *
 * CRITICAL NOTE: This service has been refactored to use parameterized queries
 * when interacting with the database to prevent SQL Injection vulnerabilities.
 * All SQL generation methods now return ParameterizedSqlStatement objects.
 */
@Injectable()
export class CustomTablesService {
  private readonly logger = new Logger(CustomTablesService.name);

  constructor(
    private readonly sqlService: SqlServerService,
    private readonly validationService: SankhyaValidationService,
  ) {}

  /**
   * Main method - Create custom table with full safety checks
   */
  async createCustomTable(dto: CreateCustomTableDto): Promise<any> {
    this.logger.warn(`=== STARTING CUSTOM TABLE CREATION: ${dto.tableName} ===`);
    this.logger.warn(`DRY-RUN MODE: ${dto.dryRun ? 'YES' : 'NO'}`);

    try {
      // STEP 1: Validate
      this.logger.log('STEP 1: Validating table definition...');
      const warnings = await this.validationService.validateCustomTable(dto);

      // STEP 2: Generate instance and field numbers
      this.logger.log('STEP 2: Generating unique IDs...');
      const nuinstancia = await this.validationService.generateUniqueInstanceNumber();
      const nucampos = await this.validationService.generateUniqueFieldNumbers(dto.fields.length);

      // STEP 3: Generate SQL statements
      this.logger.log('STEP 3: Generating SQL statements...');
      const parameterizedSqlStatements = this.generateSQLSequence(dto, nuinstancia, nucampos);

      // STEP 4: Dry-run - just return SQLs
      if (dto.dryRun) {
        this.logger.log('✅ DRY-RUN completed successfully');
        return {
          success: true,
          message: 'DRY-RUN: SQL statements generated and validated successfully',
          tableName: dto.tableName,
          nuinstancia,
          nucampos,
          generatedSQLs: parameterizedSqlStatements, // Return ParameterizedSqlStatement[]
          warnings,
        } as DryRunResponseDto;
      }

      // STEP 5: Execute with transaction
      this.logger.warn('STEP 5: EXECUTING SQL STATEMENTS IN TRANSACTION...');
      await this.executeInTransaction(parameterizedSqlStatements, dto.tableName);

      this.logger.warn(`=== ✅ TABLE ${dto.tableName} CREATED SUCCESSFULLY ===`);
      return {
        success: true,
        message: `Custom table ${dto.tableName} created successfully`,
        tableName: dto.tableName,
        nuinstancia,
        warnings,
      };
    } catch (error) {
      this.logger.error(`=== ❌ FAILED TO CREATE TABLE ${dto.tableName} ===`);
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate complete SQL sequence for custom table creation.
   * All generated SQL statements are now parameterized to prevent SQL injection.
   * Based on docs/construtor-de-telas study
   */
  private generateSQLSequence(
    dto: CreateCustomTableDto,
    nuinstancia: number,
    nucampos: number[],
  ): ParameterizedSqlStatement[] {
    // Changed return type
    this.logger.log('Generating parameterized SQL sequence...');
    const sqls: ParameterizedSqlStatement[] = []; // Changed type

    // SQL 1: Insert into TDDTAB (table metadata)
    sqls.push(this.generateTDDTABInsert(dto.tableName, dto.description));

    // SQL 2: Insert into TDDINS (instance/screen)
    sqls.push(this.generateTDDINSInsert(dto.tableName, nuinstancia, dto.description));

    // SQL 3: CREATE TABLE statement
    // Note: CREATE TABLE statements typically cannot be parameterized for table/column names.
    // Therefore, strict validation of tableName and field names is paramount,
    // and these are generated internally or validated by SankhyaValidationService.
    sqls.push(this.generateCreateTableSQL(dto.tableName, dto.fields));

    // SQL 4-N: Insert into TDDCAM (field definitions)
    dto.fields.forEach((field, index) => {
      sqls.push(this.generateTDDCAMInsert(field, nucampos[index], dto.tableName));
    });

    // SQL N+1 onwards: Insert into TDDPCO (field properties)
    dto.fields.forEach((field, index) => {
      sqls.push(this.generateTDDPCOInsert(field, nucampos[index]));
    });

    this.logger.log(`Generated ${sqls.length} parameterized SQL statements`);
    return sqls;
  }

  /**
   * SQL 1: TDDTAB - Table metadata
   * Required NOT NULL columns: NOMETAB, DESCRTAB, TIPONUMERACAO
   */
  private generateTDDTABInsert(tableName: string, description: string): ParameterizedSqlStatement {
    return {
      query: `
        INSERT INTO TDDTAB (NOMETAB, DESCRTAB, TIPONUMERACAO)
        VALUES (@tableName, @description, 'N')
      `.trim(),
      parameters: [
        { name: 'tableName', value: tableName },
        { name: 'description', value: description },
      ],
    };
  }

  /**
   * SQL 2: TDDINS - Instance/Screen definition
   * Required NOT NULL columns: NUINSTANCIA, NOMETAB, NOMEINSTANCIA, DESCRINSTANCIA, RAIZ, FILTRO, ATIVO, DEFINICAOINST, ISLIB
   * ADICIONAL = 'S' is CRITICAL for Sankhya to recognize this as a custom table!
   */
  private generateTDDINSInsert(tableName: string, nuinstancia: number, description: string): ParameterizedSqlStatement {
    return {
      query: `
        INSERT INTO TDDINS (
          NUINSTANCIA, NOMETAB, NOMEINSTANCIA, DESCRINSTANCIA,
          RAIZ, FILTRO, ATIVO, DEFINICAOINST, ISLIB, ADICIONAL
        )
        VALUES (
          @nuinstancia, @tableName, @tableName,
          @description,
          'N', 'N', 'S', 'N', 'N', 'S'
        )
      `.trim(),
      parameters: [
        { name: 'nuinstancia', value: nuinstancia },
        { name: 'tableName', value: tableName },
        { name: 'description', value: description },
      ],
    };
  }

  /**
   * SQL 3: CREATE TABLE statement
   * NOTE: Table names and column names cannot be parameterized.
   * It is assumed that `tableName` and `field.name` are thoroughly
   * validated by `SankhyaValidationService` and/or generated internally
   * to be safe SQL identifiers.
   */
  private generateCreateTableSQL(tableName: string, fields: CustomTableFieldDto[]): ParameterizedSqlStatement {
    // Ensuring tableName and field names are safe identifiers is CRITICAL here.
    // SankhyaValidationService should ensure `tableName` is safe.
    // field.name should also be validated to contain only safe characters.

    const fieldDefinitions = fields.map((field) => {
      // Validate field.name here if not already done by SankhyaValidationService
      // For now, assuming field.name is safe (alphanumeric, underscores)
      let def = `${field.name} ${this.getSQLDataType(field)}`;

      // Primary key or nullable
      if (field.isPrimaryKey) {
        def += ' NOT NULL';
      } else if (!field.nullable) {
        def += ' NOT NULL';
      }

      return def;
    });

    // Add primary key constraint
    const pkFields = fields.filter((f) => f.isPrimaryKey).map((f) => f.name);
    if (pkFields.length > 0) {
      fieldDefinitions.push(`CONSTRAINT PK_${tableName} PRIMARY KEY (${pkFields.join(', ')})`);
    }

    return {
      query: `
        CREATE TABLE ${tableName} (
          ${fieldDefinitions.join(',\n          ')}
        )
      `.trim(),
      parameters: [], // CREATE TABLE statements usually don't have value parameters
    };
  }

  /**
   * SQL 4-N: TDDCAM - Field definitions
   * Required NOT NULL columns: NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO,
   *                             PERMITEPESQUISA, CALCULADO, PERMITEPADRAO, APRESENTACAO, VISIVELGRIDPESQUISA
   */
  private generateTDDCAMInsert(
    field: CustomTableFieldDto,
    nucampo: number,
    tableName: string,
  ): ParameterizedSqlStatement {
    const tamanho = field.length || (field.dataType === 'INT' ? 10 : 0);

    return {
      query: `
        INSERT INTO TDDCAM (
          NUCAMPO, NOMETAB, NOMECAMPO, DESCRCAMPO, TIPCAMPO,
          PERMITEPESQUISA, CALCULADO, PERMITEPADRAO, APRESENTACAO, VISIVELGRIDPESQUISA,
          TAMANHO
        )
        VALUES (
          @nucampo, @tableName, @fieldName,
          @fieldDescription, @fieldType,
          'S', 'N', 'S', '1', 'S',
          @tamanho
        )
      `.trim(),
      parameters: [
        { name: 'nucampo', value: nucampo },
        { name: 'tableName', value: tableName },
        { name: 'fieldName', value: field.name },
        { name: 'fieldDescription', value: field.description || field.name },
        { name: 'fieldType', value: this.getSankhyaFieldType(field.dataType) },
        { name: 'tamanho', value: tamanho },
      ],
    };
  }

  /**
   * SQL N+1: TDDPCO - Field properties
   * Required NOT NULL columns: NUCAMPO, NOME
   * Note: Column is NOME, not NUPROP!
   */
  private generateTDDPCOInsert(field: CustomTableFieldDto, nucampo: number): ParameterizedSqlStatement {
    return {
      query: `
        INSERT INTO TDDPCO (NUCAMPO, NOME, VALOR)
        VALUES (@nucampo, @propName, @propValue)
      `.trim(),
      parameters: [
        { name: 'nucampo', value: nucampo },
        { name: 'propName', value: 'VISIVEL' }, // Assuming this is always 'VISIVEL'
        { name: 'propValue', value: 'S' }, // Assuming this is always 'S'
      ],
    };
  }

  /**
   * Convert DTO data type to SQL Server data type
   */
  private getSQLDataType(field: CustomTableFieldDto): string {
    switch (field.dataType) {
      case 'INT':
        return 'INT';
      case 'VARCHAR':
        return `VARCHAR(${field.length || 255})`;
      case 'NVARCHAR':
        return `NVARCHAR(${field.length || 255})`;
      case 'DECIMAL':
        return `DECIMAL(${field.precision || 18}, ${field.scale || 2})`;
      case 'DATETIME':
        return 'DATETIME';
      case 'BIT':
        return 'BIT';
      case 'TEXT':
        return 'TEXT';
      default:
        throw new Error(`Unsupported data type: ${field.dataType}`);
    }
  }

  /**
   * Convert SQL Server type to Sankhya field type
   */
  private getSankhyaFieldType(dataType: string): string {
    const typeMap: Record<string, string> = {
      INT: 'I',
      VARCHAR: 'C',
      NVARCHAR: 'C',
      DECIMAL: 'D',
      DATETIME: 'T',
      BIT: 'L',
      TEXT: 'M',
    };
    return typeMap[dataType] || 'C';
  }

  /**
   * Execute SQL statements within a transaction
   * CRITICAL: Uses SqlServerService.executeInTransaction() for proper transaction context.
   * This method now expects an array of ParameterizedSqlStatement.
   */
  private async executeInTransaction(
    parameterizedSqlStatements: ParameterizedSqlStatement[], // Changed type
    tableName: string,
  ): Promise<void> {
    this.logger.warn(`Executing ${parameterizedSqlStatements.length} parameterized SQL statements in transaction...`);

    try {
      // Use SqlServerService's executeInTransaction which maintains single connection
      await this.sqlService.executeInTransaction(parameterizedSqlStatements);
      this.logger.warn(`✅ Transaction completed successfully for table ${tableName}`);
    } catch (error) {
      // Error handling and rollback is done by SqlServerService
      this.logger.error(`❌ Transaction failed for table ${tableName}: ${error.message}`);
      throw new InternalServerErrorException(`Failed to create table ${tableName}: ${error.message}`);
    }
  }
}
