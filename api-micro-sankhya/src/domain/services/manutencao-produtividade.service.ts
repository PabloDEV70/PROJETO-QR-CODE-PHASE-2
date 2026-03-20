import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { ProdutividadeTecnico } from '../../types/AD_TCFEXEC';
import { produtividadeTecnicos } from '../../sql-queries/AD_TCFEXEC';

interface ProdutividadeFiltros {
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
}

/**
 * Serviço de produtividade de técnicos
 */
export class ManutencaoProdutividadeService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  /**
   * Ranking de produtividade dos técnicos
   */
  async getProdutividadeTecnicos(filtros?: ProdutividadeFiltros): Promise<ProdutividadeTecnico[]> {
    let sql = produtividadeTecnicos;
    const conditions: string[] = [];

    if (filtros?.dataInicio) {
      conditions.push(`ex.DTFIN >= '${filtros.dataInicio}'`);
    }

    if (filtros?.dataFim) {
      conditions.push(`ex.DTFIN <= '${filtros.dataFim}'`);
    }

    // Adiciona filtros de data se houver
    if (conditions.length > 0) {
      sql = sql.replace('WHERE ex.DTFIN IS NOT NULL', `WHERE ex.DTFIN IS NOT NULL AND ${conditions.join(' AND ')}`);
    }

    // Limita resultados (já tem TOP @limit na query)
    const limit = filtros?.limit || 20;
    sql = sql.replace('@limit', limit.toString());

    return this.queryExecutor.executeQuery<ProdutividadeTecnico>(sql);
  }

  /**
   * Detalhes de produtividade de um técnico específico
   */
  async getProdutividadePorTecnico(codusuexec: number): Promise<ProdutividadeTecnico | null> {
    const sql = `
      SELECT
        ex.CODUSUEXEC AS codusuexec,
        usu.NOMEUSU AS nomeTecnico,
        COUNT(DISTINCT ex.NUOS) AS totalOs,
        COUNT(*) AS totalServicos,
        SUM(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)) AS totalMinutos,
        AVG(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)) AS mediaMinutosPorServico,
        SUM(CASE WHEN ex.OBS IS NOT NULL THEN 1 ELSE 0 END) AS servicosComObs
      FROM AD_TCFEXEC ex
      JOIN TSIUSU usu ON usu.CODUSU = ex.CODUSUEXEC
      WHERE ex.CODUSUEXEC = ${codusuexec}
        AND ex.DTINI IS NOT NULL
        AND ex.DTFIN IS NOT NULL
      GROUP BY ex.CODUSUEXEC, usu.NOMEUSU
    `;

    const [row] = await this.queryExecutor.executeQuery<ProdutividadeTecnico>(sql);
    return row || null;
  }
}
