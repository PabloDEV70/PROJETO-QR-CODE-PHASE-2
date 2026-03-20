import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

export interface TableRelationship {
  NUINSTORIG: number;
  NOMEINSTORIG: string;
  DESCRINSTORIG: string;
  NUINSTDEST: number;
  NOMEINSTDEST: string;
  DESCRINSTDEST: string;
  TIPLIGACAO: string;
  NOMELIGACAO: string;
  EXPRESSAO?: string;
  INSERIR: string;
  ALTERAR: string;
  EXCLUIR: string;
  OBRIGATORIA: string;
  CONDICAO?: string;
}

export interface RelationshipField {
  NUCAMPOORIG: number;
  NOMECAMPOORIG: string;
  DESCRCAMPOORIG: string;
  NUCAMPODEST: number;
  NOMECAMPODEST: string;
  DESCRCAMPODEST: string;
  ORDEM: number;
  ORIG_OBRIGATORIA: string;
}

@Injectable()
export class DictionaryRelationshipsService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * Get all relationships for a table through its instances
   * Combines TDDLIG (table links) with TDDLGC (field mappings)
   */
  async getTableRelationships(tableName: string): Promise<{ relationships: TableRelationship[] }> {
    try {
      this.logger.debug('Fetching relationships for table', { tableName });

      // Query relationships through instances
      const query = `
        SELECT
          lig.NUINSTORIG,
          insOrig.NOMEINSTANCIA as NOMEINSTORIG,
          insOrig.DESCRINSTANCIA as DESCRINSTORIG,
          lig.NUINSTDEST,
          insDest.NOMEINSTANCIA as NOMEINSTDEST,
          insDest.DESCRINSTANCIA as DESCRINSTDEST,
          lig.TIPLIGACAO,
          lig.NOMELIGACAO,
          lig.EXPRESSAO,
          lig.INSERIR,
          lig.ALTERAR,
          lig.EXCLUIR,
          lig.OBRIGATORIA,
          lig.CONDICAO
        FROM TDDLIG lig
        INNER JOIN TDDINS insOrig ON lig.NUINSTORIG = insOrig.NUINSTANCIA
        INNER JOIN TDDINS insDest ON lig.NUINSTDEST = insDest.NUINSTANCIA
        INNER JOIN TDDTAB tabOrig ON insOrig.NOMETAB = tabOrig.NOMETAB
        WHERE tabOrig.NOMETAB = @param1
        ORDER BY lig.NOMELIGACAO
      `;

      const relationships = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase()]);

      this.logger.info('Table relationships retrieved', {
        tableName,
        count: relationships.length,
      });

      return { relationships };
    } catch (error) {
      this.logger.error('Failed to get table relationships', error as Error, { tableName });
      throw new BadRequestException({
        message: `Failed to retrieve relationships for table ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get field mappings for a specific relationship
   */
  async getRelationshipFields(originInstance: number, destInstance: number): Promise<{ fields: RelationshipField[] }> {
    try {
      this.logger.debug('Fetching relationship field mappings', {
        originInstance,
        destInstance,
      });

      const query = `
        SELECT
          lgc.NUCAMPOORIG,
          camOrig.NOMECAMPO as NOMECAMPOORIG,
          camOrig.DESCRCAMPO as DESCRCAMPOORIG,
          lgc.NUCAMPODEST,
          camDest.NOMECAMPO as NOMECAMPODEST,
          camDest.DESCRCAMPO as DESCRCAMPODEST,
          lgc.ORDEM,
          lgc.ORIG_OBRIGATORIA
        FROM TDDLGC lgc
        INNER JOIN TDDCAM camOrig ON lgc.NUCAMPOORIG = camOrig.NUCAMPO
        INNER JOIN TDDCAM camDest ON lgc.NUCAMPODEST = camDest.NUCAMPO
        WHERE lgc.NUINSTORIG = @param1
          AND lgc.NUINSTDEST = @param2
        ORDER BY lgc.ORDEM
      `;

      const fields = await this.sqlServerService.executeSQL(query, [originInstance, destInstance]);

      this.logger.info('Relationship fields retrieved', {
        originInstance,
        destInstance,
        count: fields.length,
      });

      return { fields };
    } catch (error) {
      this.logger.error('Failed to get relationship fields', error as Error, {
        originInstance,
        destInstance,
      });
      throw new BadRequestException({
        message: 'Failed to retrieve relationship field mappings',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all instances for a table
   */
  async getTableInstances(tableName: string): Promise<any[]> {
    try {
      const query = `
        SELECT
          NUINSTANCIA,
          NOMEINSTANCIA,
          DESCRINSTANCIA,
          NOMETAB,
          TIPORELACAO,
          ATUALIZAVEL
        FROM TDDINS
        WHERE NOMETAB = @param1
        ORDER BY NOMEINSTANCIA
      `;

      const instances = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase()]);

      this.logger.info('Table instances retrieved', {
        tableName,
        count: instances.length,
      });

      return instances;
    } catch (error) {
      this.logger.error('Failed to get table instances', error as Error, { tableName });
      throw new BadRequestException({
        message: `Failed to retrieve instances for table ${tableName}`,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
