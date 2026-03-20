import { apiMotherClient } from '../../infra/api-mother/client';
import {
  DbView,
  DbViewDetalhe,
  DbProcedure,
  DbProcedureDetalhe,
  DbTrigger,
  DbTriggerDetalhe,
  DbRelacionamento,
  DbListOptions,
  EstatisticasCache,
} from '../../types/DB_OBJECTS';

function cleanParams(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

export class DbObjectsService {
  async getViews(opts?: DbListOptions): Promise<DbView[]> {
    const params = cleanParams({ ...opts });
    const response = await apiMotherClient.get('/database/views', { params });
    return response.data;
  }

  async getViewDetalhe(schema: string, nome: string, truncar?: boolean): Promise<DbViewDetalhe> {
    const params = cleanParams({ truncar });
    const url = `/database/views/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`;
    const response = await apiMotherClient.get(url, { params });
    return response.data;
  }

  async getProcedures(opts?: DbListOptions): Promise<DbProcedure[]> {
    const params = cleanParams({ ...opts });
    const response = await apiMotherClient.get('/database/procedures', { params });
    return response.data;
  }

  async getProcedureDetalhe(
    schema: string,
    nome: string,
    truncar?: boolean,
  ): Promise<DbProcedureDetalhe> {
    const params = cleanParams({ truncar });
    const url = `/database/procedures/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`;
    const response = await apiMotherClient.get(url, { params });
    return response.data;
  }

  async getTriggers(opts?: DbListOptions): Promise<DbTrigger[]> {
    const params = cleanParams({ ...opts });
    const response = await apiMotherClient.get('/database/triggers', { params });
    return response.data;
  }

  async getTriggerDetalhe(
    schema: string,
    nome: string,
    truncar?: boolean,
  ): Promise<DbTriggerDetalhe> {
    const params = cleanParams({ truncar });
    const url = `/database/triggers/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`;
    const response = await apiMotherClient.get(url, { params });
    return response.data;
  }

  async getRelacionamentos(
    opts?: Pick<DbListOptions, 'schema' | 'limite' | 'offset'>,
  ): Promise<DbRelacionamento[]> {
    const params = cleanParams({ ...opts });
    const response = await apiMotherClient.get('/database/relacionamentos', { params });
    return response.data;
  }

  async getCacheEstatisticas(): Promise<EstatisticasCache> {
    const response = await apiMotherClient.get('/database/cache/estatisticas');
    return response.data;
  }
}
