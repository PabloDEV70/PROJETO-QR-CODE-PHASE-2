import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  EmTempoRealItem,
  EmTempoRealResumo,
} from '../../types/TGFVAR/em-tempo-real';
import * as Q from '../../sql-queries/TGFVAR/em-tempo-real';

export class EmTempoRealService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getMovimentacoes(): Promise<EmTempoRealItem[]> {
    return this.queryExecutor.executeQuery<EmTempoRealItem>(
      Q.emTempoRealCabs,
    );
  }

  async getResumo(): Promise<EmTempoRealResumo> {
    const rows = await this.queryExecutor.executeQuery<EmTempoRealResumo>(
      Q.emTempoRealResumo,
    );
    return rows[0] || {
      total: 0,
      atendimento: 0,
      liberada: 0,
      pendente: 0,
      baixa_estoque: 0,
      entrada_estoque: 0,
      sem_movimentacao: 0,
      reserva_estoque: 0,
      valor_total: 0,
    };
  }
}
