import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { PaginationQueryDto } from '../dto/dictionary.dto';

@Injectable()
export class DictionarySearchService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  async globalSearch(term: string, pagination: PaginationQueryDto) {
    try {
      const { limit } = pagination;
      const searchTerm = `%${term.toUpperCase()}%`;

      const [tables, fields, options] = await Promise.all([
        this.searchInTables(searchTerm, limit),
        this.searchInFields(searchTerm, limit),
        this.searchInOptions(searchTerm, limit),
      ]);

      this.logger.debug('Global search completed', {
        term,
        tablesCount: tables.length,
        fieldsCount: fields.length,
        optionsCount: options.length,
      });

      return {
        searchTerm: term,
        results: { tables, fields, options },
        totals: {
          tables: tables.length,
          fields: fields.length,
          options: options.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to perform global search', error as Error, { term });
      throw new BadRequestException('Failed to perform global search');
    }
  }

  private async searchInTables(searchTerm: string, limit: number) {
    const query = `
      SELECT TOP (@param2) 'TABLE' AS TIPO, NOMETAB AS NOME, DESCRTAB AS DESCRICAO
      FROM TDDTAB WHERE NOMETAB LIKE @param1 OR DESCRTAB LIKE @param1
    `;
    return this.sqlServerService.executeSQL(query, [searchTerm, limit]);
  }

  private async searchInFields(searchTerm: string, limit: number) {
    const query = `
      SELECT TOP (@param2) 'FIELD' AS TIPO,
        NOMETAB + '.' + NOMECAMPO AS NOME, DESCRCAMPO AS DESCRICAO
      FROM TDDCAM WHERE NOMECAMPO LIKE @param1 OR DESCRCAMPO LIKE @param1
    `;
    return this.sqlServerService.executeSQL(query, [searchTerm, limit]);
  }

  private async searchInOptions(searchTerm: string, limit: number) {
    const query = `
      SELECT TOP (@param2) 'OPTION' AS TIPO,
        c.NOMETAB + '.' + c.NOMECAMPO + '=' + o.VALOR AS NOME, o.OPCAO AS DESCRICAO
      FROM TDDOPC o
      JOIN TDDCAM c ON c.NUCAMPO = o.NUCAMPO
      WHERE o.OPCAO LIKE @param1 OR o.VALOR LIKE @param1
    `;
    return this.sqlServerService.executeSQL(query, [searchTerm, limit]);
  }
}
