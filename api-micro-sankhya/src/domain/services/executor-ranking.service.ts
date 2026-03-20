import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TCFOSCAB';
import type {
  ExecutorRankingRow,
  ExecutorRankingOptions,
  ExecutorRankingResponse,
} from '../../types/TCFOSCAB';
import { escapeSqlDate } from '../../shared/sql-sanitize';

export class ExecutorRankingService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getRanking(options: ExecutorRankingOptions = {}): Promise<ExecutorRankingResponse> {
    // Default to last 30 days if no dates provided
    const endDate = options.endDate || new Date().toISOString().split('T')[0];
    const startDate = options.startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    })();

    // Build WHERE clause for date filtering
    let query = Q.executorRanking;
    const whereClause = `AND ato.DHINI >= '${escapeSqlDate(startDate)}' AND ato.DHINI <= '${escapeSqlDate(endDate)} 23:59:59'`;
    query = query.replace('-- @WHERE', whereClause);

    const executors = await this.qe.executeQuery<ExecutorRankingRow>(query);

    return {
      period: {
        startDate,
        endDate,
      },
      data: executors,
    };
  }
}
