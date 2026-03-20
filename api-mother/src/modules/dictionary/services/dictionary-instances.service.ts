import { Injectable, BadRequestException } from '@nestjs/common';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';

@Injectable()
export class DictionaryInstancesService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly logger: StructuredLogger,
  ) {}

  async getTableInstances(tableName: string) {
    try {
      const query = `
        SELECT NUINSTANCIA, NOMEINSTANCIA, DESCRINSTANCIA, RAIZ, ATIVO, EXPRESSAO, RESOURCEID
        FROM TDDINS WHERE NOMETAB = @param1
        ORDER BY RAIZ DESC, NOMEINSTANCIA
      `;

      const result = await this.sqlServerService.executeSQL(query, [tableName.toUpperCase()]);

      this.logger.debug('Table instances retrieved', { tableName, count: result.length });
      return {
        tableName: tableName.toUpperCase(),
        instances: result,
        totalInstances: result.length,
      };
    } catch (error) {
      this.logger.error('Failed to get table instances', error as Error, { tableName });
      throw new BadRequestException('Failed to retrieve table instances');
    }
  }

  async getInstanceLinks(instanceName: string) {
    try {
      const instanceResult = await this.getInstanceInfo(instanceName);

      if (instanceResult.length === 0) {
        throw new BadRequestException(`Instance ${instanceName} not found`);
      }

      const nuinstancia = instanceResult[0].NUINSTANCIA as number;
      const links = await this.getLinksFromInstance(nuinstancia);
      const fieldMappings = await this.getFieldMappings(nuinstancia);

      this.logger.debug('Instance links retrieved', { instanceName, linksCount: links.length });
      return {
        instance: instanceResult[0],
        links,
        fieldMappings,
        totalLinks: links.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to get instance links', error as Error, { instanceName });
      throw new BadRequestException('Failed to retrieve instance links');
    }
  }

  private async getInstanceInfo(instanceName: string) {
    const query = `
      SELECT NUINSTANCIA, NOMETAB, NOMEINSTANCIA, DESCRINSTANCIA
      FROM TDDINS WHERE NOMEINSTANCIA = @param1
    `;
    return this.sqlServerService.executeSQL(query, [instanceName.toUpperCase()]);
  }

  private async getLinksFromInstance(nuinstancia: number) {
    const query = `
      SELECT l.NUINSTDEST, dest.NOMEINSTANCIA AS INSTANCIA_DESTINO,
        dest.NOMETAB AS TABELA_DESTINO, l.TIPLIGACAO, l.EXPRESSAO,
        l.INSERIR, l.ALTERAR, l.EXCLUIR, l.OBRIGATORIA
      FROM TDDLIG l
      JOIN TDDINS dest ON dest.NUINSTANCIA = l.NUINSTDEST
      WHERE l.NUINSTORIG = @param1
      ORDER BY l.OBRIGATORIA DESC
    `;
    return this.sqlServerService.executeSQL(query, [nuinstancia]);
  }

  private async getFieldMappings(nuinstancia: number) {
    const query = `
      SELECT lc.NUINSTORIG, lc.NUINSTDEST,
        origCam.NOMECAMPO AS CAMPO_ORIGEM, destCam.NOMECAMPO AS CAMPO_DESTINO,
        lc.ORIG_OBRIGATORIA
      FROM TDDLGC lc
      JOIN TDDCAM origCam ON origCam.NUCAMPO = lc.NUCAMPOORIG
      JOIN TDDCAM destCam ON destCam.NUCAMPO = lc.NUCAMPODEST
      WHERE lc.NUINSTORIG = @param1
    `;
    return this.sqlServerService.executeSQL(query, [nuinstancia]);
  }
}
