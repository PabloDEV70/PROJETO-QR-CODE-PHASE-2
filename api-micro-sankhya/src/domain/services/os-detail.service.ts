import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  OsEnrichedResponse,
  OsEnrichedHeader,
  OsServiceItem,
  OsExecutorItem,
} from '../../types/TCFOSCAB';

export class OsDetailService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getEnriched(nuos: number): Promise<OsEnrichedResponse | null> {
    const headerSql = Q.osDetailEnriched.replace(/@nuos/g, String(nuos));
    const servicesSql = Q.osServicesArray.replace(/@nuos/g, String(nuos));
    const execSql = Q.osExecutores.replace(/@nuos/g, String(nuos));

    const [headerRows, servicos, executores] = await Promise.all([
      this.qe.executeQuery<OsEnrichedHeader>(headerSql),
      this.qe.executeQuery<OsServiceItem>(servicesSql),
      this.qe.executeQuery<OsExecutorItem>(execSql),
    ]);

    if (!headerRows[0]) {
      return null;
    }

    const header = headerRows[0];
    const {
      veiculoMarca,
      veiculoPlaca,
      veiculoTag,
      veiculoTipo,
      ...osFields
    } = header;

    return {
      ...osFields,
      veiculo: {
        marca: veiculoMarca,
        placa: veiculoPlaca,
        tag: veiculoTag,
        tipo: veiculoTipo,
      },
      servicos,
      executores,
    };
  }

  async getServicos(nuos: number): Promise<OsServiceItem[]> {
    const sql = Q.osServicesArray.replace(/@nuos/g, String(nuos));
    return this.qe.executeQuery<OsServiceItem>(sql);
  }

  async getObservacao(nuos: number): Promise<string | null> {
    const sql = Q.osObservacao.replace(/@nuos/g, String(nuos));
    const result = await this.qe.executeQuery<{ observacao: string | null }>(sql);
    return result[0]?.observacao ?? null;
  }
}
