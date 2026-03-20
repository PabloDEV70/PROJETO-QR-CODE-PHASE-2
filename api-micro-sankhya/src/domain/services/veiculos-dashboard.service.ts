import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { VeiculoDashboard } from '../../types/TGFVEI/tgf-vei-dashboard';
import { VeiculoStats } from '../../types/TGFVEI/tgf-vei-stats';
import { VeiculoStatsManutencao } from '../../types/TGFVEI/tgf-vei-stats-manutencao';
import { ResumoManutencao } from '../../types/TGFVEI/tgf-vei-resumo-manutencao';
import { VeiculoAlerta } from '../../types/TGFVEI/tgf-vei-alerta';
import { VeiculoAuditoria } from '../../types/TGFVEI/tgf-vei-auditoria';
import * as Q from '../../sql-queries/TGFVEI';

export class VeiculosDashboardService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getDashboard(): Promise<VeiculoDashboard[]> {
    return this.queryExecutor.executeQuery<VeiculoDashboard>(Q.painel);
  }

  async getStats(): Promise<VeiculoStats> {
    const rows = await this.queryExecutor.executeQuery<VeiculoStats>(Q.estatisticas);
    return rows[0];
  }

  async getStatsManutencao(): Promise<VeiculoStatsManutencao> {
    const rows = await this.queryExecutor.executeQuery<VeiculoStatsManutencao>(Q.estatisticasManutencao);
    return rows[0];
  }

  async getResumoManutencoes(): Promise<ResumoManutencao[]> {
    return this.queryExecutor.executeQuery<ResumoManutencao>(Q.resumoManutencoes);
  }

  async getAlertas(): Promise<VeiculoAlerta[]> {
    return this.queryExecutor.executeQuery<VeiculoAlerta>(Q.alertas);
  }

  async getAuditoria(): Promise<VeiculoAuditoria[]> {
    return this.queryExecutor.executeQuery<VeiculoAuditoria>(Q.auditoria);
  }
}
