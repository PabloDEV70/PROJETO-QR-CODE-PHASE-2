import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  resumoRequisicoesPorStatus,
  resumoRequisicoesPorTipo,
} from '../../sql-queries/TFPREQ';
import {
  RequisicaoResumo,
  ResumoStatusRow,
  ResumoPorTipoRow,
} from '../../types/TFPREQ';

export interface ResumoParams {
  codemp?: number;
  coddep?: number;
  dataInicio?: string;
  dataFim?: string;
}

export class RhRequisicoesResumoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getResumo(params?: ResumoParams): Promise<RequisicaoResumo> {
    const whereClause = this.buildWhereClause(params);

    const [statusRows, tipoRows] = await Promise.all([
      this.queryExecutor.executeQuery<ResumoStatusRow>(
        resumoRequisicoesPorStatus.replace(/@whereClause/g, whereClause),
      ),
      this.queryExecutor.executeQuery<ResumoPorTipoRow>(
        resumoRequisicoesPorTipo.replace(/@whereClause/g, whereClause),
      ),
    ]);

    const s = statusRows[0] || {
      pendentes: 0, aprovados: 0, executados: 0,
      cancelados: 0, rejeitados: 0, total: 0, pendentesUrgentes: 0,
    };

    return {
      total: s.total,
      porStatus: {
        pendentes: s.pendentes,
        aprovados: s.aprovados,
        executados: s.executados,
        cancelados: s.cancelados,
        rejeitados: s.rejeitados,
      },
      porTipo: tipoRows.map((row) => ({
        origemTipo: row.origemTipo,
        origemTipoLabel: row.origemTipoLabel,
        quantidade: row.quantidade,
      })),
      pendentesUrgentes: s.pendentesUrgentes,
    };
  }

  private buildWhereClause(params?: ResumoParams): string {
    if (!params) return '';
    const conditions: string[] = [];
    if (params.codemp) conditions.push(`AND REQ.CODEMP = ${params.codemp}`);
    if (params.coddep) conditions.push(`AND FUN.CODDEP = ${params.coddep}`);
    if (params.dataInicio) conditions.push(`AND REQ.DTCRIACAO >= '${params.dataInicio}'`);
    if (params.dataFim) conditions.push(`AND REQ.DTCRIACAO <= '${params.dataFim}'`);
    return conditions.join(' ');
  }
}
