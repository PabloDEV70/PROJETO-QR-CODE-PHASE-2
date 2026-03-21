import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/COMPRAS';

export class ComprasService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getRequisicoesPendentes(tipo: 'compras' | 'manutencao') {
    const sql = tipo === 'manutencao'
      ? Q.requisicoesPendentesManutencao
      : Q.requisicoesPendentesCompras;
    const rows = await this.qe.executeQuery<Record<string, unknown>>(sql);
    // Filter in JS since API Mother doesn't accept arithmetic WHERE expressions
    return rows
      .filter((r) => {
        const qtdNeg = Number(r.QTDNEG) || 0;
        const qtdEnt = Number(r.QTDENTREGUE) || 0;
        return (qtdNeg - qtdEnt) > 0 && r.NUREM == null;
      })
      .map((r) => ({
        ...r,
        QTDPENDENTE: (Number(r.QTDNEG) || 0) - (Number(r.QTDENTREGUE) || 0),
      }));
  }

  async getCotacoesPendentes() {
    return this.qe.executeQuery<Record<string, unknown>>(Q.cotacoesPendentes);
  }

  async getResumoDashboard() {
    // Sequential to avoid API Mother concurrency issues
    const compras = await this.qe.executeQuery<{ total: number }>(Q.countReqCompras);
    const manut = await this.qe.executeQuery<{ total: number }>(Q.countReqManut);
    const cotacoes = await this.qe.executeQuery<{ total: number }>(Q.countCotacoes);

    return {
      requisicoesPendentesCompras: compras[0]?.total ?? 0,
      requisicoesPendentesManut: manut[0]?.total ?? 0,
      cotacoesPendentes: cotacoes[0]?.total ?? 0,
      pedidosPendentes: 0,
    };
  }
}
