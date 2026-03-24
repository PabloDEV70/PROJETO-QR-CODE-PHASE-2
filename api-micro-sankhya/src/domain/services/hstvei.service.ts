import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { cache, cacheKey } from '../../shared/cache';
import * as Q from '../../sql-queries/AD_HSTVEI';
import {
  HstVeiEnriched,
  HstVeiStats,
  ListHstVeiOptions,
  Situacao,
  Prioridade,
  PainelResponse,
  PainelVeiculo,
  PainelSituacao,
  PainelPessoa,
  HistoricoItem,
  HistoricoResponse,
  CadeiaNota,
  ItemNota,
} from '../../types/AD_HSTVEI';
import {
  CACHE_HSTVEI_PAINEL, CACHE_HSTVEI_STATS,
  CACHE_HSTVEI_LIST, CACHE_HSTVEI_LOOKUPS,
  enrichPessoas, rowToPainelSituacao, agruparPorVeiculo,
} from './hstvei-helpers';
import {
  getOperadores,
  OperadorResumo, OperadorAtribuicao,
} from './hstvei-operadores.service';

export type { OperadorResumo, OperadorAtribuicao };

export class HstVeiService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getById(id: number): Promise<HstVeiEnriched | null> {
    const sql = Q.buscarPorId.replace(/@id/g, id.toString());
    const rows = await this.qe.executeQuery<HstVeiEnriched>(sql);
    if (!rows[0]) return null;
    const enriched = await enrichPessoas(rows as unknown as Record<string, unknown>[], this.qe);
    const row = enriched[0];
    const item = rows[0];
    item.operadores = (row._operadores as PainelPessoa[]) ?? [];
    item.mecanicos = (row._mecanicos as PainelPessoa[]) ?? [];
    item.criadoPor = (row._criadoPor as PainelPessoa) ?? undefined;
    return item;
  }

  async list(options: ListHstVeiOptions): Promise<{ data: HstVeiEnriched[]; meta: { page: number; limit: number; totalRegistros: number } }> {
    const ck = cacheKey('hstvei:list', options as unknown as Record<string, unknown>);
    const cached = cache.get<{ data: HstVeiEnriched[]; meta: { page: number; limit: number; totalRegistros: number } }>(ck);
    if (cached) return cached;

    const { page, limit, codveiculo, idsit, idpri, coddep, ativas, busca, orderBy, orderDir } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (codveiculo) conditions.push(`h.CODVEICULO = ${codveiculo}`);
    if (idsit) conditions.push(`h.IDSIT = ${idsit}`);
    if (idpri !== undefined && idpri !== null) conditions.push(`h.IDPRI = ${idpri}`);
    if (coddep) conditions.push(`s.CODDEP = ${coddep}`);
    if (ativas === true) conditions.push('h.DTFIM IS NULL');
    if (ativas === false) conditions.push('h.DTFIM IS NOT NULL');
    if (busca) {
      const safe = escapeSqlString(busca);
      conditions.push(`(v.PLACA LIKE '%${safe}%' OR v.AD_TAG LIKE '%${safe}%' OR h.DESCRICAO LIKE '%${safe}%' OR s.DESCRICAO LIKE '%${safe}%')`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['ID', 'DTINICIO', 'DTPREVISAO', 'DTFIM', 'IDSIT', 'IDPRI', 'CODVEICULO', 'DTCRIACAO'];
    const safeOrderBy = orderBy && allowedSorts.includes(orderBy.toUpperCase()) ? `h.${orderBy}` : 'h.DTINICIO';
    const safeDir = orderDir === 'ASC' ? 'ASC' : 'DESC';

    const countSql = Q.listarCount.replace('-- @WHERE', whereSql);
    const listSql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', `${safeOrderBy} ${safeDir}`)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const [countRows, data] = await Promise.all([
      this.qe.executeQuery<{ totalRegistros: number }>(countSql),
      this.qe.executeQuery<HstVeiEnriched>(listSql),
    ]);

    const enrichedRows = await enrichPessoas(data as unknown[] as Record<string, unknown>[], this.qe);
    for (let i = 0; i < data.length; i++) {
      const row = enrichedRows[i];
      data[i].operadores = (row._operadores as PainelPessoa[]) ?? [];
      data[i].mecanicos = (row._mecanicos as PainelPessoa[]) ?? [];
      data[i].criadoPor = (row._criadoPor as PainelPessoa) ?? undefined;
    }

    const result = { data, meta: { page, limit, totalRegistros: countRows[0]?.totalRegistros ?? 0 } };
    cache.set(ck, result, CACHE_HSTVEI_LIST);
    return result;
  }

  async getPainel(): Promise<PainelResponse> {
    const ck = 'hstvei:painel';
    const cached = cache.get<PainelResponse>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<Record<string, unknown>>(Q.painelTodos);
    const enrichedRows = await enrichPessoas(rows, this.qe);
    const veiculos = agruparPorVeiculo(enrichedRows);

    const result: PainelResponse = {
      veiculos,
      totalVeiculos: veiculos.length,
      totalSituacoesAtivas: rows.length,
      atualizadoEm: new Date().toISOString(),
    };
    cache.set(ck, result, CACHE_HSTVEI_PAINEL);
    return result;
  }

  async getAtivasPorVeiculo(codveiculo: number): Promise<PainelSituacao[]> {
    const sql = Q.ativasPorVeiculo.replace(/@codveiculo/g, codveiculo.toString());
    const rows = await this.qe.executeQuery<Record<string, unknown>>(sql);
    const enriched = await enrichPessoas(rows, this.qe);
    return enriched.map((r) => rowToPainelSituacao(r));
  }

  async getHistorico(codveiculo: number, page: number, limit: number): Promise<HistoricoResponse> {
    const offset = (page - 1) * limit;
    const countSql = Q.historicoVeiculoCount.replace(/@codveiculo/g, codveiculo.toString());
    const dataSql = Q.historicoVeiculo
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    const veiculoSql = `SELECT PLACA, CAST(MARCAMODELO AS VARCHAR(200)) AS marcaModelo FROM TGFVEI WHERE CODVEICULO = ${codveiculo}`;

    const [countRows, data, veiculoRows] = await Promise.all([
      this.qe.executeQuery<{ totalRegistros: number }>(countSql),
      this.qe.executeQuery<HistoricoItem>(dataSql),
      this.qe.executeQuery<{ PLACA: string; marcaModelo: string | null }>(veiculoSql),
    ]);

    const enrichedData = await enrichPessoas(data as unknown[] as Record<string, unknown>[], this.qe);
    for (let i = 0; i < data.length; i++) {
      const row = enrichedData[i];
      data[i].operadores = (row._operadores as PainelPessoa[]) ?? [];
      data[i].mecanicos = (row._mecanicos as PainelPessoa[]) ?? [];
      data[i].criadoPor = (row._criadoPor as PainelPessoa) ?? undefined;
    }

    return {
      codveiculo,
      placa: veiculoRows[0]?.PLACA ?? '',
      marcaModelo: veiculoRows[0]?.marcaModelo ?? null,
      historico: data,
      meta: { page, limit, totalRegistros: countRows[0]?.totalRegistros ?? 0 },
    };
  }

  async getSituacoes(): Promise<Situacao[]> {
    const ck = 'hstvei:situacoes';
    const cached = cache.get<Situacao[]>(ck);
    if (cached) return cached;
    const rows = await this.qe.executeQuery<Situacao>(Q.situacoes);
    cache.set(ck, rows, CACHE_HSTVEI_LOOKUPS);
    return rows;
  }

  async getPrioridades(): Promise<Prioridade[]> {
    const ck = 'hstvei:prioridades';
    const cached = cache.get<Prioridade[]>(ck);
    if (cached) return cached;
    const rows = await this.qe.executeQuery<Prioridade>(Q.prioridades);
    cache.set(ck, rows, CACHE_HSTVEI_LOOKUPS);
    return rows;
  }

  async getStats(): Promise<HstVeiStats> {
    const ck = 'hstvei:stats';
    const cached = cache.get<HstVeiStats>(ck);
    if (cached) return cached;
    const rows = await this.qe.executeQuery<HstVeiStats>(Q.stats);
    const result = rows[0] ?? {
      veiculosComSituacao: 0, situacoesAtivas: 0, urgentes: 0,
      atrasadas: 0, previsao3dias: 0, veiculosManutencao: 0,
      veiculosComercial: 0, veiculosLogistica: 0, veiculosOperacao: 0,
    };
    cache.set(ck, result, CACHE_HSTVEI_STATS);
    return result;
  }

  async getProximosLiberar(): Promise<PainelVeiculo[]> {
    const ck = 'hstvei:proximos';
    const cached = cache.get<PainelVeiculo[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<Record<string, unknown>>(Q.painelTodos);
    const enrichedRows = await enrichPessoas(rows, this.qe);
    const veiculos = agruparPorVeiculo(enrichedRows);

    const proximos = veiculos
      .filter((v) => v.situacoesAtivas.length > 0)
      .sort((a, b) => {
        const aData = a.situacoesAtivas[0]?.dtprevisao;
        const bData = b.situacoesAtivas[0]?.dtprevisao;
        if (!aData && !bData) return 0;
        if (!aData) return 1;
        if (!bData) return -1;
        return new Date(aData).getTime() - new Date(bData).getTime();
      })
      .slice(0, 10);

    cache.set(ck, proximos, CACHE_HSTVEI_PAINEL);
    return proximos;
  }

  async getOperadores(): Promise<OperadorResumo[]> {
    return getOperadores(this.qe);
  }

  async getCadeiaNotas(nunota: number): Promise<CadeiaNota[]> {
    const sql = Q.cadeiaNotas.replace(/@nunota/g, nunota.toString());
    return this.qe.executeQuery<CadeiaNota>(sql);
  }

  async getItensNota(nunota: number): Promise<ItemNota[]> {
    const sql = Q.itensNota.replace(/@nunota/g, nunota.toString());
    return this.qe.executeQuery<ItemNota>(sql);
  }

  async getItensOsComercial(numos: number): Promise<Record<string, unknown>[]> {
    const sql = Q.itensOsComercial.replace(/@numos/g, numos.toString());
    return this.qe.executeQuery<Record<string, unknown>>(sql);
  }
}
