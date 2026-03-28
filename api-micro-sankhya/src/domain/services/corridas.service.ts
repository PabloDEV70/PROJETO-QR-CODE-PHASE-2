import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import { getRedisClient } from '../../infra/redis/redis-client';
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

  async buscarParceiros(search: string): Promise<unknown[]> {
    const term = escapeSqlString(search);
    const sql = `
      SELECT TOP 20 P.CODPARC, P.NOMEPARC, P.TELEFONE, P.CEP, P.NUMEND,
        E.NOMEEND AS RUA, B.NOMEBAI AS BAIRRO, C.NOMECID AS CIDADE, U.UF
      FROM TGFPAR P WITH (NOLOCK)
      LEFT JOIN TSIEND E ON E.CODEND = P.CODEND
      LEFT JOIN TSIBAI B ON B.CODBAI = P.CODBAI
      LEFT JOIN TSICID C ON C.CODCID = P.CODCID
      LEFT JOIN TSIUFS U ON U.CODUF = C.UF
      WHERE P.ATIVO = 'S'
        AND (P.NOMEPARC LIKE '%${term}%' OR CAST(P.CODPARC AS VARCHAR) LIKE '%${term}%')
      ORDER BY P.NOMEPARC
    `;
    return this.qe.executeQuery(sql);
  }

  async getMotoristasDetalhado(): Promise<unknown[]> {
    const ck = cacheKey('corridas:motoristas-detalhado');
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const sql = `
      SELECT U.CODUSU, U.NOMEUSU, U.CODPARC, F.NOMEFUNC AS NOMECOMPLETO,
        CAR.DESCRCARGO AS CARGO,
        COUNT(C.ID) as TOTAL_CORRIDAS,
        SUM(CASE WHEN C.STATUS = '0' THEN 1 ELSE 0 END) as ABERTAS,
        SUM(CASE WHEN C.STATUS = '1' THEN 1 ELSE 0 END) as EM_ANDAMENTO
      FROM TSIUSU U WITH (NOLOCK)
      INNER JOIN TFPFUN F ON F.CODEMP = U.CODEMP AND F.CODFUNC = U.CODFUNC
      INNER JOIN TFPCAR CAR ON CAR.CODCARGO = F.CODCARGO
      LEFT JOIN AD_CHAMADOSCORRIDAS C ON C.USU_MOTORISTA = U.CODUSU
      WHERE UPPER(CAR.DESCRCARGO) LIKE '%MOTORISTA%'
      GROUP BY U.CODUSU, U.NOMEUSU, U.CODPARC, F.NOMEFUNC, CAR.DESCRCARGO
      ORDER BY TOTAL_CORRIDAS DESC
    `;
    const rows = await this.qe.executeQuery(sql);
    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async saveLocalizacao(
    corridaId: number,
    data: { lat: number; lng: number; accuracy?: number; codusu: number },
  ): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    const payload = JSON.stringify({
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy ?? null,
      ts: new Date().toISOString(),
      codusu: data.codusu,
    });

    await redis.set(`corrida:loc:${corridaId}`, payload, 'EX', 300);
    return true;
  }

  async getLocalizacao(corridaId: number): Promise<{
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    ts: string | null;
    codusu: number | null;
    tempoDesde: number | null;
  }> {
    const redis = getRedisClient();
    if (!redis) return { lat: null, lng: null, accuracy: null, ts: null, codusu: null, tempoDesde: null };

    const raw = await redis.get(`corrida:loc:${corridaId}`);
    if (!raw) return { lat: null, lng: null, accuracy: null, ts: null, codusu: null, tempoDesde: null };

    const parsed = JSON.parse(raw);
    const tempoDesde = parsed.ts
      ? Math.round((Date.now() - new Date(parsed.ts).getTime()) / 1000)
      : null;

    return {
      lat: parsed.lat,
      lng: parsed.lng,
      accuracy: parsed.accuracy ?? null,
      ts: parsed.ts,
      codusu: parsed.codusu,
      tempoDesde,
    };
  }

  async getMinhas(options: {
    codusu: number;
    role: 'solicitante' | 'motorista';
    status?: string;
    limit: number;
  }): Promise<unknown[]> {
    const column = options.role === 'motorista' ? 'USU_MOTORISTA' : 'USU_SOLICITANTE';
    const conditions: string[] = [`C.${column} = ${options.codusu}`];
    if (options.status) conditions.push(`C.STATUS = '${options.status}'`);

    const whereSql = `AND ${conditions.join(' AND ')}`;
    const listSql = Q.getList
      .replace('-- @ORDER', 'C.DT_CREATED DESC')
      .replace('-- @WHERE', whereSql)
      .replace(/@OFFSET/g, '0')
      .replace(/@LIMIT/g, options.limit.toString());

    return this.qe.executeQuery(listSql);
  }

  async saveMinhaLocalizacao(
    codusu: number,
    data: { lat: number; lng: number; accuracy?: number },
  ): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    const payload = JSON.stringify({
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy ?? null,
      ts: new Date().toISOString(),
      codusu,
    });

    await redis.set(`user:loc:${codusu}`, payload, 'EX', 120);
    return true;
  }

  async getLocalizacoesAtivas(): Promise<
    { codusu: number; nome: string; codparc: number | null; cargo: string | null; lat: number; lng: number; accuracy: number | null; ts: string; tempoDesde: number }[]
  > {
    const redis = getRedisClient();
    if (!redis) return [];

    const keys = await redis.keys('user:loc:*');
    if (!keys.length) return [];

    const values = await redis.mget(...keys);

    const parsed: { codusu: number; lat: number; lng: number; accuracy: number | null; ts: string; tempoDesde: number }[] = [];
    for (const raw of values) {
      if (!raw) continue;
      try {
        const item = JSON.parse(raw);
        const tempoDesde = item.ts
          ? Math.round((Date.now() - new Date(item.ts).getTime()) / 1000)
          : 0;
        parsed.push({
          codusu: item.codusu,
          lat: item.lat,
          lng: item.lng,
          accuracy: item.accuracy ?? null,
          ts: item.ts,
          tempoDesde,
        });
      } catch {
        /* skip malformed */
      }
    }

    if (!parsed.length) return [];

    const codusuList = parsed.map((p) => p.codusu);
    const userInfoMap = await this.getUserInfoBatch(codusuList);

    return parsed.map((p) => {
      const info = userInfoMap.get(p.codusu);
      return {
        ...p,
        nome: info?.nome ?? '',
        codparc: info?.codparc ?? null,
        cargo: info?.cargo ?? null,
      };
    });
  }

  private async getUserInfoBatch(
    codusuList: number[],
  ): Promise<Map<number, { nome: string; codparc: number | null; cargo: string | null }>> {
    const ck = cacheKey('corridas:user-info-batch', { ids: codusuList.sort().join(',') });
    const cached = cache.get<Map<number, { nome: string; codparc: number | null; cargo: string | null }>>(ck);
    if (cached) return cached;

    const inClause = codusuList.join(',');
    const sql = `
      SELECT U.CODUSU, U.NOMEUSU, U.CODPARC,
        CAR.DESCRCARGO AS CARGO
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TFPFUN F ON F.CODEMP = U.CODEMP AND F.CODFUNC = U.CODFUNC
      LEFT JOIN TFPCAR CAR ON CAR.CODCARGO = F.CODCARGO
      WHERE U.CODUSU IN (${inClause})
    `;
    const rows = await this.qe.executeQuery<{
      CODUSU: number;
      NOMEUSU: string;
      CODPARC: number | null;
      CARGO: string | null;
    }>(sql);

    const map = new Map<number, { nome: string; codparc: number | null; cargo: string | null }>();
    for (const row of rows) {
      map.set(row.CODUSU, { nome: row.NOMEUSU, codparc: row.CODPARC, cargo: row.CARGO });
    }

    cache.set(ck, map, CACHE_TTL.FILTERS); // 5 min
    return map;
  }

  async getUserRole(codusu: number): Promise<{
    codusu: number;
    nome: string;
    codparc: number | null;
    cargo: string | null;
    departamento: string | null;
    isMotorista: boolean;
  }> {
    const sql = `
      SELECT U.CODUSU, U.NOMEUSU, U.CODPARC,
        CAR.DESCRCARGO AS CARGO,
        F.DEPARTAMENTO
      FROM TSIUSU U WITH (NOLOCK)
      LEFT JOIN TFPFUN F ON F.CODEMP = U.CODEMP AND F.CODFUNC = U.CODFUNC
      LEFT JOIN TFPCAR CAR ON CAR.CODCARGO = F.CODCARGO
      WHERE U.CODUSU = ${codusu}
    `;
    const rows = await this.qe.executeQuery<{
      CODUSU: number;
      NOMEUSU: string;
      CODPARC: number | null;
      CARGO: string | null;
      DEPARTAMENTO: string | null;
    }>(sql);

    const row = rows[0];
    if (!row) {
      return { codusu, nome: '', codparc: null, cargo: null, departamento: null, isMotorista: false };
    }

    const cargo = row.CARGO ?? '';
    return {
      codusu: row.CODUSU,
      nome: row.NOMEUSU,
      codparc: row.CODPARC,
      cargo: row.CARGO,
      departamento: row.DEPARTAMENTO,
      isMotorista: cargo.toUpperCase().includes('MOTORISTA'),
    };
  }
}
