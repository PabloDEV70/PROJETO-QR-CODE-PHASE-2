import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  DashboardVisaoGeral,
  OsPendente,
  AtividadeRecente,
  DashboardIndicadores,
} from '../../types/dashboard';
import * as Q from '../../sql-queries/dashboard';

export class DashboardService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getVisaoGeral(): Promise<DashboardVisaoGeral> {
    const rows = await this.queryExecutor.executeQuery<DashboardVisaoGeral>(Q.visaoGeral);
    return rows[0];
  }

  async getOsPendentes(): Promise<OsPendente[]> {
    return this.queryExecutor.executeQuery<OsPendente>(Q.osPendentes);
  }

  async getAtividadeRecente(): Promise<AtividadeRecente[]> {
    return this.queryExecutor.executeQuery<AtividadeRecente>(Q.atividadeRecente);
  }

  async getIndicadores(): Promise<DashboardIndicadores> {
    const [
      osManutencaoResult,
      osComercialResult,
      tempoResult,
      horasResult,
      mediaResult,
    ] = await Promise.all([
      this.queryExecutor.executeQuery<{
        totalOSManutencao: number;
        osManutencaoFechadas: number;
      }>(Q.osManutencaoTotals),
      this.queryExecutor.executeQuery<{
        totalOSComercial: number;
        osComercialFechadas: number;
      }>(Q.osComercialTotals),
      this.queryExecutor.executeQuery<{ tempoMedio: number | null }>(Q.tempoMedioResolucao),
      this.queryExecutor.executeQuery<{ totalHoras: number }>(Q.horasRDOUltimoMes),
      this.queryExecutor.executeQuery<{ mediaItens: number | null }>(Q.mediaItensPorRDO),
    ]);

    const osManut = osManutencaoResult[0];
    const osComerc = osComercialResult[0];

    return {
      taxaConclusaoOSManutencao:
        osManut.totalOSManutencao > 0
          ? (osManut.osManutencaoFechadas * 100.0) / osManut.totalOSManutencao
          : 0,
      taxaConclusaoOSComercial:
        osComerc.totalOSComercial > 0
          ? (osComerc.osComercialFechadas * 100.0) / osComerc.totalOSComercial
          : 0,
      tempoMedioResolucaoOSManutencao: tempoResult[0].tempoMedio,
      totalHorasRDOUltimoMes: horasResult[0].totalHoras,
      mediaItensPorRDO: mediaResult[0].mediaItens,
    };
  }
}
