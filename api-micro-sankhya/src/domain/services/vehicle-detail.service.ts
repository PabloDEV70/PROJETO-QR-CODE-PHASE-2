import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  VehicleDetailResponse,
  VehicleKpiRow,
  VehicleOsItem,
} from '../../types/TCFOSCAB';

export class VehicleDetailService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getDetail(codveiculo: number): Promise<VehicleDetailResponse | null> {
    const kpisSql = Q.vehicleKpis.replace(/@codveiculo/g, String(codveiculo));
    const historySql = Q.vehicleHistory.replace(/@codveiculo/g, String(codveiculo));

    const [kpiRows, osHistory] = await Promise.all([
      this.qe.executeQuery<VehicleKpiRow>(kpisSql),
      this.qe.executeQuery<VehicleOsItem>(historySql),
    ]);

    if (!kpiRows[0]) {
      return null;
    }

    const kpi = kpiRows[0];

    // Calculate availability: MTBF/(MTBF+MTTR)*100
    let availability: number | null = null;
    if (kpi.mtbfDias !== null && kpi.mttrHoras !== null) {
      const mtbfHours = kpi.mtbfDias * 24;
      availability = (mtbfHours / (mtbfHours + kpi.mttrHoras)) * 100;
    }

    return {
      codveiculo: kpi.codveiculo,
      placa: kpi.placa,
      marca: kpi.marca,
      tag: kpi.tag,
      tipo: kpi.tipo,
      kpis: {
        totalOS: kpi.totalOS,
        mttrHoras: kpi.mttrHoras,
        mtbfDias: kpi.mtbfDias,
        availability,
      },
      osHistory,
    };
  }
}
