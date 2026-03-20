import { apiMotherClient } from '../../infra/api-mother/client';
import { ResumoBanco } from '../../types/DB_OBJECTS';

export interface TabelaInfo {
  TABLE_NAME: string;
  TABLE_TYPE: string;
}

export interface ColunaSchema {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  ORDINAL_POSITION: number;
  COLUMN_DEFAULT: string | null;
}

export class DbTablesService {
  async getTables(): Promise<TabelaInfo[]> {
    const response = await apiMotherClient.get('/inspection/tables');
    const body = response.data;
    return body?.data?.tables ?? body?.tables ?? [];
  }

  async getTableSchema(tableName: string): Promise<ColunaSchema[]> {
    const response = await apiMotherClient.get('/inspection/table-schema', {
      params: { tableName },
    });
    const body = response.data;
    return Array.isArray(body?.data) ? body.data : body?.data ?? [];
  }

  async getTableKeys(tableName: string): Promise<unknown[]> {
    const response = await apiMotherClient.get(
      `/inspection/primary-keys/${encodeURIComponent(tableName)}`,
    );
    const body = response.data;
    return body?.data?.primaryKeys ?? body?.primaryKeys ?? [];
  }

  async getTableRelations(tableName: string): Promise<unknown> {
    const response = await apiMotherClient.get('/inspection/table-relations', {
      params: { tableName },
    });
    return response.data;
  }

  async getResumo(): Promise<ResumoBanco> {
    const response = await apiMotherClient.get('/database/resumo');
    return response.data;
  }
}
