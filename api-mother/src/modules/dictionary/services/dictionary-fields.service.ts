import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { PaginationQueryDto } from '../dto/dictionary.dto';

@Injectable()
export class DictionaryFieldsService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  async getTableFields(tableName: string, pagination: PaginationQueryDto) {
    // Use very high default limit if not provided
    const limit = pagination?.limit ?? 10000;
    const offset = pagination?.offset ?? 0;

    this.logger.info('getTableFields called', { tableName, limit, offset });

    // Query based on Sankhya's actual TDDCAM structure
    const query = `
      SELECT TOP (@param2)
        c.NUCAMPO,
        c.NOMETAB,
        c.NOMECAMPO,
        c.DESCRCAMPO,
        c.TIPCAMPO,
        c.TIPOAPRESENTACAO,
        c.TAMANHO,
        c.MASCARA,
        c.EXPRESSAO,
        c.PERMITEPESQUISA,
        c.CALCULADO,
        c.PERMITEPADRAO,
        c.APRESENTACAO,
        c.ORDEM,
        c.VISIVELGRIDPESQUISA,
        c.SISTEMA,
        c.ADICIONAL,
        c.CONTROLE,
        (SELECT COUNT(*) FROM TDDOPC o WHERE o.NUCAMPO = c.NUCAMPO) AS QTD_OPCOES
      FROM TDDCAM c WITH (NOLOCK)
      WHERE c.NOMETAB = @param1
      ORDER BY c.ORDEM, c.NOMECAMPO
    `;

    const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase(), limit]);

    const countQuery = `SELECT COUNT(*) AS total FROM TDDCAM WITH (NOLOCK) WHERE NOMETAB = @param1`;
    const countResult = await this.sqlServerService.executeSQL(countQuery, [tableName.toUpperCase()]);

    this.logger.debug('Table fields retrieved', { tableName, count: result.length });
    return {
      tableName: tableName.toUpperCase(),
      data: result,
      pagination: { limit, offset, total: countResult[0]?.total || 0 },
    };
  }

  async getFieldDetails(tableName: string, fieldName: string) {
    // Query based on Sankhya's actual TDDCAM structure
    const query = `
      SELECT
        c.NUCAMPO,
        c.NOMETAB,
        c.NOMECAMPO,
        c.DESCRCAMPO,
        c.TIPCAMPO,
        c.TIPOAPRESENTACAO,
        c.TAMANHO,
        c.MASCARA,
        c.EXPRESSAO,
        c.PERMITEPESQUISA,
        c.CALCULADO,
        c.PERMITEPADRAO,
        c.APRESENTACAO,
        c.ORDEM,
        c.VISIVELGRIDPESQUISA,
        c.SISTEMA,
        c.ADICIONAL,
        c.CONTROLE
      FROM TDDCAM c WITH (NOLOCK)
      WHERE c.NOMETAB = @param1 AND c.NOMECAMPO = @param2
    `;

    const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase(), fieldName.toUpperCase()]);

    if (result.length === 0) {
      throw new BadRequestException(`Field ${fieldName} not found in table ${tableName}`);
    }

    const nucampo = result[0].NUCAMPO as number;
    const options = await this.getFieldOptionsInternal(nucampo);
    const properties = await this.getFieldPropertiesInternal(nucampo);

    this.logger.debug('Field details retrieved', { tableName, fieldName });
    return { ...result[0], options, properties };
  }

  async searchFields(term: string, pagination: PaginationQueryDto) {
    const limit = pagination?.limit ?? 10000;
    const offset = pagination?.offset ?? 0;
    const searchTerm = `%${term.toUpperCase()}%`;

    const query = `
      SELECT TOP (@param2)
        c.NUCAMPO, c.NOMETAB, c.NOMECAMPO, c.DESCRCAMPO,
        c.TIPCAMPO, c.TIPOAPRESENTACAO, t.DESCRTAB AS DESCRTABELA
      FROM TDDCAM c WITH (NOLOCK)
      LEFT JOIN TDDTAB t WITH (NOLOCK) ON t.NOMETAB = c.NOMETAB
      WHERE c.NOMECAMPO LIKE @param1 OR c.DESCRCAMPO LIKE @param1
      ORDER BY c.NOMETAB, c.NOMECAMPO
    `;

    const result = await this.sqlServerService.executeSQL(query, [searchTerm, limit]);

    const countQuery = `
      SELECT COUNT(*) AS total FROM TDDCAM WITH (NOLOCK)
      WHERE NOMECAMPO LIKE @param1 OR DESCRCAMPO LIKE @param1
    `;
    const countResult = await this.sqlServerService.executeSQL(countQuery, [searchTerm]);

    this.logger.debug('Field search completed', { term, count: result.length });
    return {
      data: result,
      searchTerm: term,
      pagination: { limit, offset, total: countResult[0]?.total || 0 },
    };
  }

  private async getFieldOptionsInternal(nucampo: number) {
    const query = `
      SELECT NUCAMPO, VALOR, OPCAO, PADRAO, ORDEM, CONTROLE, DOMAIN
      FROM TDDOPC WITH (NOLOCK)
      WHERE NUCAMPO = @param1
      ORDER BY ORDEM, VALOR
    `;
    return this.sqlServerService.executeSQL(query, [nucampo]);
  }

  private async getFieldPropertiesInternal(nucampo: number) {
    const query = `
      SELECT NOME, VALOR
      FROM TDDPCO WITH (NOLOCK)
      WHERE NUCAMPO = @param1
    `;
    return this.sqlServerService.executeSQL(query, [nucampo]);
  }
}
