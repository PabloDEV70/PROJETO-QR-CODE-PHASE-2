import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/AD_CHAMADOSCORRIDAS';

export interface ListCorridasOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  status?: string;
  motorista?: number;
  solicitante?: number;
  codparc?: number;
  buscarLevar?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
}

export interface ListCorridasResult {
  data: unknown[];
  total: number;
}

export interface Motorista {
  CODUSU: number;
  NOMEUSU: string;
}

export interface CorridaResumo {
  STATUS: string;
  TOTAL: number;
}

const STATUS_MAP: Record<string, string> = {
  '0': 'Aberto',
  '1': 'Em Andamento',
  '2': 'Concluido',
  '3': 'Cancelado',
};

function buildWhereFilters(options: ListCorridasOptions): string {
  const conditions: string[] = [];

  if (options.status) conditions.push(`C.STATUS = '${options.status}'`);
  if (options.motorista) conditions.push(`C.USU_MOTORISTA = ${options.motorista}`);
  if (options.solicitante) conditions.push(`C.USU_SOLICITANTE = ${options.solicitante}`);
  if (options.codparc) conditions.push(`C.CODPARC = ${options.codparc}`);
  if (options.buscarLevar) conditions.push(`C.BUSCARLEVAR = '${options.buscarLevar}'`);
  if (options.dataInicio) conditions.push(`C.DT_CREATED >= '${escapeSqlDate(options.dataInicio)}'`);
  if (options.dataFim) conditions.push(`C.DT_CREATED <= '${escapeSqlDate(options.dataFim)} 23:59:59'`);
  if (options.search) {
    const term = escapeSqlString(options.search);
    conditions.push(
      `(C.DESTINO LIKE '%${term}%'` +
      ` OR CAST(C.OBS AS VARCHAR(MAX)) LIKE '%${term}%'` +
      ` OR CAST(C.PASSAGEIROSMERCADORIA AS VARCHAR(MAX)) LIKE '%${term}%'` +
      ` OR P.NOMEPARC LIKE '%${term}%'` +
      ` OR CAST(C.ID AS VARCHAR) LIKE '%${term}%')`,
    );
  }

  return conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
}

export class CorridasService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getList(options: ListCorridasOptions): Promise<ListCorridasResult> {
    const { page, limit, orderBy = 'DT_CREATED', orderDir = 'DESC' } = options;
    const offset = (page - 1) * limit;
    const whereSql = buildWhereFilters(options);
    const allowedSorts = ['DT_CREATED', 'DT_UPDATED', 'DT_ACIONAMENTO', 'STATUS', 'PRIORIDADE', 'ID'];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `C.${orderBy}` : 'C.DT_CREATED';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const listSql = Q.getList
      .replace('-- @ORDER', orderSql)
      .replace('-- @WHERE', whereSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const countSql = Q.getCount.replace('-- @WHERE', whereSql);

    const [data, countRows] = await Promise.all([
      this.qe.executeQuery<unknown>(listSql),
      this.qe.executeQuery<{ TOTAL: number }>(countSql),
    ]);

    return { data, total: countRows[0]?.TOTAL || 0 };
  }

  async getById(id: number): Promise<unknown | null> {
    const sql = Q.getById.replace(/@ID/g, id.toString());
    const rows = await this.qe.executeQuery<unknown>(sql);
    return rows[0] || null;
  }

  async getMotoristas(): Promise<Motorista[]> {
    const ck = cacheKey('corridas:motoristas');
    const cached = cache.get<Motorista[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<Motorista>(Q.getMotoristas);
    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getResumo(): Promise<{ porStatus: { status: string; label: string; total: number }[]; total: number }> {
    const ck = cacheKey('corridas:resumo');
    const cached = cache.get<{ porStatus: { status: string; label: string; total: number }[]; total: number }>(ck);
    if (cached) return cached;

    const statusRows = await this.qe.executeQuery<CorridaResumo>(Q.getResumo);

    const porStatus = statusRows.map((r) => ({
      status: r.STATUS,
      label: STATUS_MAP[r.STATUS] || r.STATUS,
      total: r.TOTAL,
    }));

    const total = porStatus.reduce((sum, r) => sum + r.total, 0);
    const result = { porStatus, total };

    cache.set(ck, result, CACHE_TTL.CHAMADOS);
    return result;
  }
}
