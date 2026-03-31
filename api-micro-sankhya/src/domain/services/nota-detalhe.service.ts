import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TGFCAB';
import type {
  NotaDetalheCab,
  NotaDetalheItem,
  NotaDetalheTop,
  NotaDetalheVar,
  NotaDetalheCompleta,
} from '../../types/TGFCAB';

export class NotaDetalheService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getDetalhe(nunota: number): Promise<NotaDetalheCompleta | null> {
    const nu = String(nunota);
    const cabSql = Q.notaDetalheCab.replace(/@nunota/g, nu);
    const itensSql = Q.notaDetalheItens.replace(/@nunota/g, nu);
    const topSql = Q.notaDetalheTop.replace(/@nunota/g, nu);
    const varSql = Q.notaDetalheVar.replace(/@nunota/g, nu);

    const [cabRows, itens, topRows, variacoes] = await Promise.all([
      this.qe.executeQuery<NotaDetalheCab>(cabSql),
      this.qe.executeQuery<NotaDetalheItem>(itensSql),
      this.qe.executeQuery<NotaDetalheTop>(topSql),
      this.qe.executeQuery<NotaDetalheVar>(varSql),
    ]);

    if (!cabRows[0]) {
      return null;
    }

    return {
      cabecalho: cabRows[0],
      itens,
      top: topRows[0] || null,
      variacoes,
    };
  }
}
