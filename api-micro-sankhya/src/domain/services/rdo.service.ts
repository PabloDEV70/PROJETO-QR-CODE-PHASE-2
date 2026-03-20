import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  RdoCompleto, RdoDetalheCompleto, RdoStats,
  RdoResumoDiario, ListRdoOptions, RdoListItem, RdoListResponse,
} from '../../types/AD_RDOAPONTAMENTOS';
import { parseIncludeExclude, buildFilterSql } from '../../shared/utils/filter-parser';
import * as Q from '../../sql-queries/AD_RDOAPONTAMENTOS';
import { enrichWithCargaHoraria } from './rdo-list.helpers';
import { enrichWithProdutividade } from './rdo-produtividade.helpers';
import { RdoStatsService } from './rdo-stats.service';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import { escapeSqlString, escapeSqlDate, escapeSqlLike } from '../../shared/sql-sanitize';

export class RdoService {
  private queryExecutor: QueryExecutor;
  private statsService: RdoStatsService;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.statsService = new RdoStatsService();
  }

  async getById(codrdo: number): Promise<RdoCompleto | null> {
    const sql = Q.buscarPorId.replace('@codrdo', codrdo.toString());
    const rows = await this.queryExecutor.executeQuery<RdoCompleto>(sql);
    return rows[0] || null;
  }

  async search(term: string): Promise<RdoCompleto[]> {
    const sanitizedTerm = escapeSqlString(term);
    const sql = Q.pesquisar.replace(/@sanitizedTerm/g, sanitizedTerm);
    return this.queryExecutor.executeQuery<RdoCompleto>(sql);
  }

  async list(options: ListRdoOptions): Promise<RdoListResponse> {
    const {
      page, limit, codparc, dataInicio, dataFim,
      comOs, semOs, coddep, codcargo, codfuncao, codemp,
      orderBy = 'DTREF', orderDir = 'DESC',
    } = options;
    const offset = (page - 1) * limit;

    // Cache key based on all params (sorted for deterministic keys)
    const ck = cacheKey('rdo:list', options as unknown as Record<string, unknown>);
    const cached = cache.get<RdoListResponse>(ck);
    if (cached) return cached;

    const conditions: string[] = [];

    if (codparc) {
      const filter = parseIncludeExclude(codparc);
      const sql = buildFilterSql('rdo.CODPARC', filter);
      if (sql) conditions.push(sql);
    }
    if (coddep) {
      const filter = parseIncludeExclude(coddep);
      const sql = buildFilterSql('fun.CODDEP', filter);
      if (sql) conditions.push(sql);
    }
    if (codcargo) {
      const filter = parseIncludeExclude(codcargo);
      const sql = buildFilterSql('fun.CODCARGO', filter);
      if (sql) conditions.push(sql);
    }
    if (codfuncao) {
      const filter = parseIncludeExclude(codfuncao);
      const sql = buildFilterSql('fun.CODFUNCAO', filter);
      if (sql) conditions.push(sql);
    }
    if (codemp) {
      const filter = parseIncludeExclude(codemp);
      const sql = buildFilterSql('fun.CODEMP', filter);
      if (sql) conditions.push(sql);
    }
    if (dataInicio) {
      conditions.push(`rdo.DTREF >= '${escapeSqlDate(dataInicio)}'`);
    }
    if (dataFim) {
      conditions.push(`rdo.DTREF <= '${escapeSqlDate(dataFim)}'`);
    }
    if (comOs === true) {
      conditions.push(
        `EXISTS (SELECT 1 FROM AD_RDOAPONDETALHES d WHERE d.CODRDO = rdo.CODRDO AND d.NUOS IS NOT NULL)`,
      );
    }
    if (semOs === true) {
      conditions.push(
        `NOT EXISTS (SELECT 1 FROM AD_RDOAPONDETALHES d WHERE d.CODRDO = rdo.CODRDO AND d.NUOS IS NOT NULL)`,
      );
    }

    const whereSql = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}`
      : '';

    const allowedSorts: Record<string, string> = {
      CODRDO: 'rdo.CODRDO',
      DTREF: 'rdo.DTREF',
      CODPARC: 'rdo.CODPARC',
      nomeparc: 'parc.NOMEPARC',
      totalHoras: 'totalHoras',
      totalItens: 'totalItens',
    };
    const safeOrderBy = allowedSorts[orderBy] || 'rdo.DTREF';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const countSql = Q.listarCount.replace('-- @WHERE', whereSql);
    const dataSql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const [countResult, data] = await Promise.all([
      this.queryExecutor.executeQuery<{ totalRegistros: number }>(countSql),
      this.queryExecutor.executeQuery<RdoListItem>(dataSql),
    ]);

    await enrichWithCargaHoraria(data, this.queryExecutor);
    await enrichWithProdutividade(data, this.queryExecutor);

    const result: RdoListResponse = {
      data,
      meta: {
        page,
        limit,
        totalRegistros: countResult[0]?.totalRegistros || 0,
      },
    };
    cache.set(ck, result, CACHE_TTL.RDO_LIST);
    return result;
  }

  async getByIdEnriched(codrdo: number): Promise<RdoListItem | null> {
    const ck = `rdo:enriched:${codrdo}`;
    const cached = cache.get<RdoListItem | null>(ck);
    if (cached !== undefined) return cached;

    const sql = Q.getByIdEnriched.replace('@codrdo', codrdo.toString());
    const data = await this.queryExecutor.executeQuery<RdoListItem>(sql);
    if (data.length === 0) { cache.set(ck, null, CACHE_TTL.RDO_METRICAS); return null; }
    await enrichWithCargaHoraria(data, this.queryExecutor);
    await enrichWithProdutividade(data, this.queryExecutor);
    cache.set(ck, data[0], CACHE_TTL.RDO_METRICAS);
    return data[0];
  }

  async getDetalhes(codrdo: number): Promise<RdoDetalheCompleto[]> {
    const ck = `rdo:det:${codrdo}`;
    const cached = cache.get<RdoDetalheCompleto[]>(ck);
    if (cached) return cached;

    const sql = Q.detalhes.replace('@codrdo', codrdo.toString());
    const rows = await this.queryExecutor.executeQuery<RdoDetalheCompleto>(sql);
    cache.set(ck, rows, CACHE_TTL.RDO_DETALHES);
    return rows;
  }

  async getByParceiro(codparc: number, page: number, limit: number): Promise<RdoCompleto[]> {
    return this.statsService.getByParceiro(codparc, page, limit);
  }

  async getByVeiculo(codveiculo: number, page: number, limit: number): Promise<RdoCompleto[]> {
    return this.statsService.getByVeiculo(codveiculo, page, limit);
  }

  async getStats(dataInicio?: string, dataFim?: string): Promise<RdoStats> {
    return this.statsService.getStats(dataInicio, dataFim);
  }

  async getQuemFazSnapshot(data: string) {
    const ck = `rdo:quemfaz:${data}`;
    const cached = cache.get<Record<string, unknown>[]>(ck);
    if (cached) return cached;

    const safeData = escapeSqlDate(data);

    // 3 simple queries in parallel — API Mother can't handle complex JOINs/CTEs
    const [baseRows, detRows, osRows] = await Promise.all([
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        Q.quemFazBase.replace(/@data/g, safeData),
      ),
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        Q.quemFazDetalhes.replace(/@data/g, safeData),
      ),
      this.queryExecutor.executeQuery<Record<string, unknown>>(
        Q.quemFazOsAtivas,
      ),
    ]);

    // Build lookup: last detalhe per CODRDO (detRows already ordered by HRINI DESC)
    const lastDetMap = new Map<number, Record<string, unknown>>();
    for (const d of detRows) {
      const codrdo = d.CODRDO as number;
      if (!lastDetMap.has(codrdo)) lastDetMap.set(codrdo, d);
    }

    // Build lookup: OS ativas per CODPARC
    const osMap = new Map<number, number>();
    for (const o of osRows) {
      osMap.set(o.CODPARC as number, o.osAtivasCount as number);
    }

    // Merge
    const merged = baseRows.map((base) => {
      const codrdo = base.CODRDO as number;
      const codparc = base.CODPARC as number;
      const det = lastDetMap.get(codrdo);
      return {
        ...base,
        ultItem: det?.ITEM ?? null,
        ultHrini: det?.HRINI ?? null,
        ultHrfim: det?.HRFIM ?? null,
        ultMotivoCod: det?.RDOMOTIVOCOD ?? null,
        ultMotivoSigla: det?.ultMotivoSigla ?? null,
        ultMotivoDesc: det?.ultMotivoDesc ?? null,
        ultMotivoProdutivo: det?.ultMotivoProdutivo ?? null,
        ultMotivoCategoria: det?.ultMotivoCategoria ?? null,
        ultNuos: det?.NUOS ?? null,
        ultSequenciaOs: det?.AD_SEQUENCIA_OS ?? null,
        ultOsStatus: det?.ultOsStatus ?? null,
        ultOsTipo: det?.ultOsTipo ?? null,
        ultOsManutencao: det?.ultOsManutencao ?? null,
        ultOsPlaca: det?.ultOsPlaca ?? null,
        ultOsModelo: det?.ultOsModelo ?? null,
        ultOsTag: det?.ultOsTag ?? null,
        ultOsTipoEqpto: det?.ultOsTipoEqpto ?? null,
        ultSrvCodProd: det?.ultSrvCodProd ?? null,
        ultSrvNome: det?.ultSrvNome ?? null,
        ultSrvStatus: det?.ultSrvStatus ?? null,
        ultSrvTempo: det?.ultSrvTempo ?? null,
        osAtivasCount: osMap.get(codparc) ?? 0,
      };
    });

    // Sort by last activity time DESC
    merged.sort((a, b) => ((b.ultHrini as number) ?? 0) - ((a.ultHrini as number) ?? 0));

    cache.set(ck, merged, CACHE_TTL.QUEM_FAZ);
    return merged;
  }

  async getResumoDiario(
    page: number,
    limit: number,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<RdoResumoDiario[]> {
    return this.statsService.getResumoDiario(page, limit, dataInicio, dataFim);
  }
}
