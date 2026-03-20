import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  OsDashboardKpis,
  DashboardKpisRow,
  MtbfByVehicle,
} from '../../types/TCFOSCAB';

export class OsDashboardService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getDashboard(): Promise<OsDashboardKpis> {
    // Execute both queries in parallel
    const [kpisResult, mtbfRows] = await Promise.all([
      this.qe.executeQuery<DashboardKpisRow>(Q.dashboardKpisUnified),
      this.qe.executeQuery<MtbfByVehicle>(Q.mtbfByVehicle),
    ]);

    const kpisRow = kpisResult[0];

    // Calculate overall MTBF as weighted average across all vehicles
    let overallMtbf: number | null = null;
    if (mtbfRows.length > 0) {
      const validRows = mtbfRows.filter((r) => r.mtbfDias !== null && r.totalFalhas > 0);
      if (validRows.length > 0) {
        const sumWeighted = validRows.reduce(
          (acc, r) => acc + (r.mtbfDias ?? 0) * r.totalFalhas,
          0,
        );
        const sumFalhas = validRows.reduce((acc, r) => acc + r.totalFalhas, 0);
        overallMtbf = sumFalhas > 0 ? sumWeighted / sumFalhas : null;
      }
    }

    // Construct response
    return {
      totalOS: kpisRow.totalOS,
      mttrHoras: kpisRow.mttrHoras,
      mtbfDias: overallMtbf,
      statusDistribution: {
        aberta: kpisRow.statusAberta,
        emExecucao: kpisRow.statusEmExecucao,
        finalizada: kpisRow.statusFinalizada,
        cancelada: kpisRow.statusCancelada,
      },
      typeDistribution: {
        corretiva: kpisRow.tipoCorretiva,
        preventiva: kpisRow.tipoPreventiva,
        outros: kpisRow.tipoOutros,
      },
      mtbfByVehicle: mtbfRows,
    };
  }
}
