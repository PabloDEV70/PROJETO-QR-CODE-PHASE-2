import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import { escapeSqlDate } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/AD_CHAMADOSCORRIDAS';

export interface StatsDateFilter {
  dataInicio?: string;
  dataFim?: string;
}

interface TempoTransitoResult {
  AVG_MINUTOS: number | null;
  MIN_MINUTOS: number | null;
  MAX_MINUTOS: number | null;
}

interface PorMotoristaResult {
  USU_MOTORISTA: number;
  NOMEMOTORISTA: string;
  TOTAL: number;
}

interface PorSolicitanteResult {
  USU_SOLICITANTE: number;
  NOMESOLICITANTE: string;
  TOTAL: number;
}

interface PorParceiroResult {
  CODPARC: number;
  NOMEPARC: string;
  TOTAL: number;
}

interface VolumeMensalResult {
  ANO: number;
  MES: number;
  TOTAL: number;
}

interface PorTipoResult {
  BUSCARLEVAR: string;
  TOTAL: number;
}

interface PorHoraResult {
  HORA: number;
  TOTAL: number;
}

function buildDateWhere(options?: StatsDateFilter): string {
  if (!options) return '';
  const conditions: string[] = [];
  if (options.dataInicio) conditions.push(`AND C.DT_CREATED >= '${escapeSqlDate(options.dataInicio)}'`);
  if (options.dataFim) conditions.push(`AND C.DT_CREATED <= '${escapeSqlDate(options.dataFim)} 23:59:59'`);
  return conditions.join(' ');
}

export class CorridasStatsService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getTempoTransito(options?: StatsDateFilter): Promise<TempoTransitoResult> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:tempo-transito', { where: whereSql });
    const cached = cache.get<TempoTransitoResult>(ck);
    if (cached) return cached;

    const sql = Q.getStatsTempoTransito.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<TempoTransitoResult>(sql);
    const result = rows[0] || { AVG_MINUTOS: null, MIN_MINUTOS: null, MAX_MINUTOS: null };

    cache.set(ck, result, CACHE_TTL.CHAMADOS);
    return result;
  }

  async getPorMotorista(options?: StatsDateFilter): Promise<PorMotoristaResult[]> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:por-motorista', { where: whereSql });
    const cached = cache.get<PorMotoristaResult[]>(ck);
    if (cached) return cached;

    const sql = Q.getStatsPorMotorista.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<PorMotoristaResult>(sql);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getPorSolicitante(options?: StatsDateFilter): Promise<PorSolicitanteResult[]> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:por-solicitante', { where: whereSql });
    const cached = cache.get<PorSolicitanteResult[]>(ck);
    if (cached) return cached;

    const sql = Q.getStatsPorSolicitante.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<PorSolicitanteResult>(sql);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getPorParceiro(options?: StatsDateFilter): Promise<PorParceiroResult[]> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:por-parceiro', { where: whereSql });
    const cached = cache.get<PorParceiroResult[]>(ck);
    if (cached) return cached;

    const sql = Q.getStatsPorParceiro.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<PorParceiroResult>(sql);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getVolumeMensal(): Promise<VolumeMensalResult[]> {
    const ck = cacheKey('corridas:stats:volume-mensal');
    const cached = cache.get<VolumeMensalResult[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<VolumeMensalResult>(Q.getStatsVolumeMensal);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getPorTipo(options?: StatsDateFilter): Promise<PorTipoResult[]> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:por-tipo', { where: whereSql });
    const cached = cache.get<PorTipoResult[]>(ck);
    if (cached) return cached;

    const sql = Q.getStatsPorTipo.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<PorTipoResult>(sql);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getPorHora(options?: StatsDateFilter): Promise<PorHoraResult[]> {
    const whereSql = buildDateWhere(options);
    const ck = cacheKey('corridas:stats:por-hora', { where: whereSql });
    const cached = cache.get<PorHoraResult[]>(ck);
    if (cached) return cached;

    const sql = Q.getStatsPorHora.replace('-- @WHERE', whereSql);
    const rows = await this.qe.executeQuery<PorHoraResult>(sql);

    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }
}
