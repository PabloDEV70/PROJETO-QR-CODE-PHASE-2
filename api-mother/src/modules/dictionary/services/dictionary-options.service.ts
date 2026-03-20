import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

@Injectable()
export class DictionaryOptionsService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  async getFieldOptions(tableName: string, fieldName: string) {
    try {
      const query = `
        SELECT o.NUCAMPO, o.OPCAO, o.VALOR, o.PADRAO, o.ORDEM
        FROM TDDOPC o
        WHERE o.NUCAMPO = (
          SELECT NUCAMPO FROM TDDCAM WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
        )
        ORDER BY o.ORDEM
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase(), fieldName.toUpperCase()]);

      this.logger.debug('Field options retrieved', {
        tableName,
        fieldName,
        count: result.length,
      });
      return {
        tableName: tableName.toUpperCase(),
        fieldName: fieldName.toUpperCase(),
        options: result,
        totalOptions: result.length,
      };
    } catch (error) {
      this.logger.error('Failed to get field options', error as Error, { tableName, fieldName });
      throw new BadRequestException('Failed to retrieve field options');
    }
  }

  async getOptionsByNucampo(nucampo: number) {
    try {
      const query = `
        SELECT o.NUCAMPO, o.OPCAO, o.VALOR, o.PADRAO, o.ORDEM
        FROM TDDOPC o WHERE o.NUCAMPO = @param1 ORDER BY o.ORDEM
      `;

      const result = await this.sqlServerService.executeSQL(query, [nucampo]);

      const fieldQuery = `
        SELECT NOMETAB, NOMECAMPO, DESCRCAMPO FROM TDDCAM WHERE NUCAMPO = @param1
      `;
      const fieldInfo = await this.sqlServerService.executeSQL(fieldQuery, [nucampo]);

      this.logger.debug('Options by NUCAMPO retrieved', { nucampo, count: result.length });
      return {
        nucampo,
        field: fieldInfo[0] || null,
        options: result,
        totalOptions: result.length,
      };
    } catch (error) {
      this.logger.error('Failed to get options by NUCAMPO', error as Error, { nucampo });
      throw new BadRequestException('Failed to retrieve options');
    }
  }

  async getFieldProperties(tableName: string, fieldName: string) {
    try {
      const query = `
        SELECT p.NOME, p.VALOR
        FROM TDDPCO p
        WHERE p.NUCAMPO = (
          SELECT NUCAMPO FROM TDDCAM WHERE NOMETAB = @param1 AND NOMECAMPO = @param2
        )
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase(), fieldName.toUpperCase()]);

      this.logger.debug('Field properties retrieved', {
        tableName,
        fieldName,
        count: result.length,
      });
      return {
        tableName: tableName.toUpperCase(),
        fieldName: fieldName.toUpperCase(),
        properties: result,
        totalProperties: result.length,
      };
    } catch (error) {
      this.logger.error('Failed to get field properties', error as Error, {
        tableName,
        fieldName,
      });
      throw new BadRequestException('Failed to retrieve field properties');
    }
  }
}
