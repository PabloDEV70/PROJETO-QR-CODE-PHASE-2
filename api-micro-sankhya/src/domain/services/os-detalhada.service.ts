import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  OsDetalhadaCab,
  OsDetalhadaServico,
  OsDetalhadaExecucao,
  OsDetalhadaApontamento,
  OsDetalhadaCompleta,
} from '../../types/TCFOSCAB';

export class OsDetalhadaService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getDetalhada(nuos: number): Promise<OsDetalhadaCompleta | null> {
    const nuosStr = String(nuos);
    const cabSql = Q.osDetalhadaCab.replace(/@nuos/g, nuosStr);
    const svcSql = Q.osDetalhadaServicos.replace(/@nuos/g, nuosStr);
    const execSql = Q.osDetalhadaExecucoes.replace(/@nuos/g, nuosStr);
    const apontSql = Q.osDetalhadaApontamentos.replace(/@nuos/g, nuosStr);

    const [cabRows, servicos, execucoes, apontamentos] = await Promise.all([
      this.qe.executeQuery<OsDetalhadaCab>(cabSql),
      this.qe.executeQuery<OsDetalhadaServico>(svcSql),
      this.qe.executeQuery<OsDetalhadaExecucao>(execSql),
      this.qe.executeQuery<OsDetalhadaApontamento>(apontSql),
    ]);

    if (!cabRows[0]) return null;

    return {
      cabecalho: cabRows[0],
      servicos,
      execucoes,
      apontamentos,
    };
  }
}
