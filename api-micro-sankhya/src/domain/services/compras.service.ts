import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/COMPRAS';

const PRIORIDADE_MAP: Record<number, string> = {
  0: 'EMERGENCIA', 1: 'MUITO URGENTE', 2: 'URGENTE',
  3: 'POUCO URGENTE', 4: 'PROGRAMADA',
};

export class ComprasService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getRequisicoesPendentes(tipo: 'compras' | 'manutencao') {
    let cabs: Record<string, unknown>[];

    if (tipo === 'manutencao') {
      cabs = await this.qe.executeQuery<Record<string, unknown>>(Q.requisicoesPendentesManutencao);
    } else {
      // API Mother doesn't support IN() — query each CODTIPOPER separately
      const results: Record<string, unknown>[] = [];
      for (const cod of [502, 504, 506, 507]) {
        const sql = Q.requisicoesPendentesCompras.replace('PLACEHOLDER_TIPOPER', String(cod));
        const rows = await this.qe.executeQuery<Record<string, unknown>>(sql);
        results.push(...rows);
      }
      cabs = results;
    }

    // Map prioridade label in JS
    return cabs.map((r) => ({
      ...r,
      PRIORIDADE: PRIORIDADE_MAP[Number(r.AD_PRIORIDADE)] ?? '',
    })).sort((a, b) =>
      (Number((a as Record<string, unknown>).AD_PRIORIDADE) || 99) - (Number((b as Record<string, unknown>).AD_PRIORIDADE) || 99),
    );
  }

  async getCotacoesPendentes() {
    return this.qe.executeQuery<Record<string, unknown>>(Q.cotacoesPendentes);
  }

  async getResumoDashboard() {
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
