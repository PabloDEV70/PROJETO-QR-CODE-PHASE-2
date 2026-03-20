import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  HistoricoVeiculo,
  OsHistoricoItem,
  ServicoMaisExecutado,
  ObservacaoHistorico,
} from '../../types/TCFOSCAB/historico-veiculo';
import * as Q from '../../sql-queries/TCFOSCAB';
import { ExecucaoDetalhe } from '../../types/AD_TCFEXEC';
import { historicoOs } from '../../sql-queries/AD_TCFEXEC';

interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Serviço de histórico de manutenção
 * Histórico completo de veículos, execuções e observações técnicas
 */
export class ManutencaoHistoricoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  /**
   * Resumo do histórico de um veículo
   */
  async getHistoricoResumo(codveiculo: number): Promise<HistoricoVeiculo | null> {
    const sql = Q.historicoResumo.replace('@codveiculo', codveiculo.toString());
    const [row] = await this.queryExecutor.executeQuery<HistoricoVeiculo>(sql);
    return row || null;
  }

  /**
   * Lista paginada de OS do veículo
   */
  async getHistoricoOsList(
    codveiculo: number,
    params: PaginationParams = {}
  ): Promise<{ data: OsHistoricoItem[]; total: number }> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const sql = Q.historicoOsList
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace('@offset', offset.toString())
      .replace('@limit', limit.toString());

    const countSql = `SELECT COUNT(*) AS total FROM TCFOSCAB WHERE CODVEICULO = ${codveiculo}`;

    const [data, countResult] = await Promise.all([
      this.queryExecutor.executeQuery<OsHistoricoItem>(sql),
      this.queryExecutor.executeQuery<{ total: number }>(countSql),
    ]);

    return {
      data,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Serviços mais executados no veículo
   */
  async getServicosMaisExecutados(codveiculo: number): Promise<ServicoMaisExecutado[]> {
    const sql = Q.servicosMaisExecutados.replace('@codveiculo', codveiculo.toString());
    return this.queryExecutor.executeQuery<ServicoMaisExecutado>(sql);
  }

  /**
   * Observações técnicas do histórico
   */
  async getObservacoes(
    codveiculo: number,
    params: PaginationParams = {}
  ): Promise<{ data: ObservacaoHistorico[]; total: number }> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const sql = Q.observacoesHistorico
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace('@offset', offset.toString())
      .replace('@limit', limit.toString());

    const countSql = `
      SELECT COUNT(*) AS total
      FROM TCFOSCAB cab
      JOIN TCFSERVOS srv ON srv.NUOS = cab.NUOS
      LEFT JOIN AD_TCFEXEC ex ON ex.NUOS = srv.NUOS AND ex.SEQUENCIA = srv.SEQUENCIA
      WHERE cab.CODVEICULO = ${codveiculo}
        AND (srv.OBSERVACAO IS NOT NULL OR ex.OBS IS NOT NULL)
    `;

    const [data, countResult] = await Promise.all([
      this.queryExecutor.executeQuery<ObservacaoHistorico>(sql),
      this.queryExecutor.executeQuery<{ total: number }>(countSql),
    ]);

    return {
      data,
      total: countResult[0]?.total || 0,
    };
  }

  /**
   * Histórico completo de execução de uma OS
   */
  async getHistoricoOs(nuos: number): Promise<ExecucaoDetalhe[]> {
    const sql = historicoOs.replace('@nuos', nuos.toString());
    return this.queryExecutor.executeQuery<ExecucaoDetalhe>(sql);
  }
}
