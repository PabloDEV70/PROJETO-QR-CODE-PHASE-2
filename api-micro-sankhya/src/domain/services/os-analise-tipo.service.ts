import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  OsAnaliseTipoVeiculo,
  OsTendenciaTipoVeiculo,
} from '../../types/TCFOSCAB';

export class OsAnaliseTipoService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getAnalisePorTipo(opts: {
    dataInicio?: string;
    dataFim?: string;
  }): Promise<OsAnaliseTipoVeiculo[]> {
    const where = this.buildWhere(opts);
    const sql = Q.analisePorTipoVeiculo.replace('-- @WHERE', where);
    return this.qe.executeQuery<OsAnaliseTipoVeiculo>(sql);
  }

  async getTendenciaPorTipo(
    tipoVeiculo: string,
  ): Promise<OsTendenciaTipoVeiculo[]> {
    const sql = Q.tendenciaTipoVeiculo
      .replace('@tipoVeiculo', this.esc(tipoVeiculo));
    return this.qe.executeQuery<OsTendenciaTipoVeiculo>(sql);
  }

  private buildWhere(opts: {
    dataInicio?: string;
    dataFim?: string;
  }): string {
    const parts: string[] = [];
    if (opts.dataInicio) {
      parts.push(`AND O.DTABERTURA >= '${this.esc(opts.dataInicio)}'`);
    }
    if (opts.dataFim) {
      parts.push(
        `AND O.DTABERTURA <= '${this.esc(opts.dataFim)} 23:59:59'`,
      );
    }
    return parts.join('\n');
  }

  private esc(val: string): string {
    return escapeSqlString(val);
  }
}
