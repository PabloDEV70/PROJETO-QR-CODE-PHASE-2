import {
  parseIncludeExclude,
  buildFilterSql,
} from '../../shared/utils/filter-parser';
import type { RdoAnalyticsOptions } from '../../types/AD_RDOAPONTAMENTOS';
import { escapeSqlDate } from '../../shared/sql-sanitize';

export function buildWhere(options: RdoAnalyticsOptions): string {
  const conditions: string[] = [];
  if (options.dataInicio) {
    conditions.push(`rdo.DTREF >= '${escapeSqlDate(options.dataInicio)}'`);
  }
  if (options.dataFim) {
    conditions.push(`rdo.DTREF <= '${escapeSqlDate(options.dataFim)}'`);
  }
  applyFilter(conditions, options.codparc, 'rdo.CODPARC');
  applyFilter(conditions, options.coddep, 'fun.CODDEP');
  applyFilter(conditions, options.codcargo, 'fun.CODCARGO');
  applyFilter(conditions, options.codfuncao, 'fun.CODFUNCAO');
  applyFilter(conditions, options.codemp, 'fun.CODEMP');
  return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
}

function applyFilter(
  conditions: string[],
  raw: string | undefined,
  column: string,
): void {
  if (!raw) return;
  const filter = parseIncludeExclude(raw);
  const sql = buildFilterSql(column, filter);
  if (sql) conditions.push(sql);
}

const ALLOWED_ORDER: Record<string, string> = {
  totalHoras: 'totalHoras', totalRdos: 'totalRdos',
  totalItens: 'totalItens', mediaHorasPorRdo: 'mediaHorasPorRdo',
  desvioPadrao: 'desvioPadrao', percentualComOs: 'percentualComOs',
  mediaMinutosPorItem: 'mediaMinutosPorItem',
  percentualCurtos: 'percentualCurtos',
  motivosDiferentes: 'motivosDiferentes',
  nomeparc: 'parc.NOMEPARC',
};

export function buildOrder(
  orderBy: string, orderDir: string, fallback: string,
): string {
  return `${ALLOWED_ORDER[orderBy] || fallback} ${orderDir}`;
}
