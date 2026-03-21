import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import {
  IAdAponTsolWithProduto,
  IAdAponTsolResumo,
  IAdAponTsolPendente,
  IAdAponTsolComOs,
  IServicoFrequente,
  IProdutoUtilizado,
  IAdAponTsolByVeiculo,
  IAdAponTsolTimeline,
  ListPorPeriodoOptions,
  ListPaginadoOptions,
} from '../../types/AD_APONTSOL/index';
import * as Q from '../../sql-queries/AD_APONTSOL';
import * as QApon from '../../sql-queries/AD_APONTAMENTO';
import { cache } from '../../shared/cache/memory-cache';
import { cacheKey } from '../../shared/cache/cache-keys';
import { CACHE_TTL } from '../../shared/cache/cache-ttl';

export interface ListApontamentosOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  statusOs?: string;
  codveiculo?: number;
  dtInicio?: string;
  dtFim?: string;
  search?: string;
}

const ALLOWED_ORDER_COLS: Record<string, string> = {
  codigo: 'A.CODIGO',
  codveiculo: 'A.CODVEICULO',
  dtinclusao: 'A.DTINCLUSAO',
  km: 'A.KM',
  statusos: 'A.STATUSOS',
  placa: 'V.PLACA',
  nomeusu: 'U.NOMEUSU',
  totalservicos: 'totalServicos',
};

export class ApontamentosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getResumo(): Promise<IAdAponTsolResumo | null> {
    const key = cacheKey('apontamentos:resumo');
    const cached = cache.get<IAdAponTsolResumo>(key);
    if (cached) return cached;

    const rows = await this.queryExecutor.executeQuery<IAdAponTsolResumo>(Q.getResumo);
    const result = rows[0] || null;
    if (result) cache.set(key, result, CACHE_TTL.RESUMO);
    return result;
  }

  async getPendentes(options: ListPaginadoOptions): Promise<IAdAponTsolPendente[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const sql = Q.getPendentesSemOs
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<IAdAponTsolPendente>(sql);
  }

  async getComOs(options: ListPaginadoOptions): Promise<IAdAponTsolComOs[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const sql = Q.getComOs
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<IAdAponTsolComOs>(sql);
  }

  async getServicosFrequentes(): Promise<IServicoFrequente[]> {
    const key = cacheKey('apontamentos:servicos-frequentes');
    const cached = cache.get<IServicoFrequente[]>(key);
    if (cached) return cached;

    const rows = await this.queryExecutor.executeQuery<IServicoFrequente>(
      Q.getServicosFrequentes,
    );
    cache.set(key, rows, CACHE_TTL.RESUMO);
    return rows;
  }

  async getByProduto(): Promise<IProdutoUtilizado[]> {
    return this.queryExecutor.executeQuery<IProdutoUtilizado>(Q.getByProduto);
  }

  async getByVeiculo(codveiculo?: number): Promise<IAdAponTsolByVeiculo[]> {
    let sql = Q.getByVeiculo;
    if (codveiculo) {
      sql = sql.replace('-- @WHERE', `AND A.CODVEICULO = ${codveiculo.toString()}`);
    }
    return this.queryExecutor.executeQuery<IAdAponTsolByVeiculo>(sql);
  }

  async getByPeriodo(options: ListPorPeriodoOptions): Promise<IAdAponTsolWithProduto[]> {
    const { dtini, dtfim, page, limit } = options;
    const offset = (page - 1) * limit;
    const sql = Q.getByPeriodo
      .replace(/@DTINI/g, dtini)
      .replace(/@DTFIM/g, dtfim)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<IAdAponTsolWithProduto>(sql);
  }

  async getTimelineVeiculo(
    codveiculo: number,
    options: ListPaginadoOptions,
  ): Promise<IAdAponTsolTimeline[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;
    const sql = Q.getTimelineVeiculo
      .replace(/@CODVEICULO/g, codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<IAdAponTsolTimeline>(sql);
  }

  async getByApontamento(codigo: number): Promise<IAdAponTsolWithProduto[]> {
    const sql = Q.getByApontamento.replace(/@CODIGO/g, codigo.toString());
    return this.queryExecutor.executeQuery<IAdAponTsolWithProduto>(sql);
  }

  async getHistoricoServico(codveiculo: number, codprod: number) {
    const sql = `
      SELECT TOP 20
        SOL.CODIGO, SOL.SEQ, SOL.QTD, SOL.NUOS, SOL.DTPROGRAMACAO,
        AP.DTINCLUSAO, AP.KM AS KM_APON, AP.HORIMETRO AS HR_APON, AP.TAG,
        U.NOMEUSU,
        CAST(SOL.DESCRITIVO AS VARCHAR(500)) AS DESCRITIVO,
        P.DESCRPROD,
        OS.STATUS,
        CASE OS.STATUS
          WHEN 'A' THEN 'Aberta' WHEN 'R' THEN 'Reaberta'
          WHEN 'E' THEN 'Em execucao' WHEN 'F' THEN 'Finalizada'
          ELSE OS.STATUS END AS STATUSOS,
        OS.DTABERTURA, OS.DATAFIN, OS.DATAINI, OS.PREVISAO,
        OS.MANUTENCAO,
        CASE OS.MANUTENCAO
          WHEN 'C' THEN 'Corretiva' WHEN 'P' THEN 'Preventiva'
          WHEN 'D' THEN 'Preditiva' ELSE OS.MANUTENCAO END AS TIPOMANUT,
        OS.KM AS KM_OS, OS.HORIMETRO AS HR_OS,
        OS.AD_STATUSGIG,
        DATEDIFF(DAY, OS.DTABERTURA, ISNULL(OS.DATAFIN, GETDATE())) AS DIAS_OS
      FROM AD_APONTSOL SOL
      JOIN AD_APONTAMENTO AP ON AP.CODIGO = SOL.CODIGO
      LEFT JOIN TGFPRO P ON P.CODPROD = SOL.CODPROD
      LEFT JOIN TSIUSU U ON U.CODUSU = AP.CODUSU
      LEFT JOIN TCFOSCAB OS ON OS.NUOS = SOL.NUOS
      WHERE SOL.CODPROD = ${Number(codprod)} AND AP.CODVEICULO = ${Number(codveiculo)}
      ORDER BY AP.DTINCLUSAO DESC
    `;
    return this.queryExecutor.executeQuery<Record<string, unknown>>(sql);
  }

  // Search support: code, placa, tag, usuario, marca/modelo
  async list(options: ListApontamentosOptions) {
    const { page, limit, orderBy, orderDir, statusOs, codveiculo, dtInicio, dtFim, search } = options;
    const offset = (page - 1) * limit;

    const whereParts: string[] = [];
    if (statusOs) whereParts.push(`AND A.STATUSOS = '${escapeSqlString(statusOs)}'`);
    if (codveiculo) whereParts.push(`AND A.CODVEICULO = ${Number(codveiculo)}`);
    if (dtInicio) whereParts.push(`AND A.DTINCLUSAO >= ${escapeSqlDate(dtInicio)}`);
    if (dtFim) whereParts.push(`AND A.DTINCLUSAO <= '${escapeSqlString(dtFim)} 23:59:59'`);
    if (search) {
      const s = escapeSqlString(search);
      const isNumeric = /^\d+$/.test(search);
      if (isNumeric) {
        whereParts.push(`AND (A.CODIGO = ${Number(search)} OR V.PLACA LIKE '%${s}%' OR A.TAG LIKE '%${s}%')`);
      } else {
        whereParts.push(`AND (V.PLACA LIKE '%${s}%' OR A.TAG LIKE '%${s}%' OR U.NOMEUSU LIKE '%${s}%' OR CAST(V.MARCAMODELO AS VARCHAR(200)) LIKE '%${s}%')`);
      }
    }
    const whereSql = whereParts.join('\n  ');

    const col = ALLOWED_ORDER_COLS[(orderBy ?? 'codigo').toLowerCase()] ?? 'A.CODIGO';
    const dir = orderDir === 'ASC' ? 'ASC' : 'DESC';
    const orderSql = `${col} ${dir}`;

    const dataSql = QApon.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const countSql = QApon.listarCount.replace('-- @WHERE', whereSql);

    const [rows, countRows] = await Promise.all([
      this.queryExecutor.executeQuery<Record<string, unknown>>(dataSql),
      this.queryExecutor.executeQuery<{ totalRegistros: number }>(countSql),
    ]);

    const total = countRows[0]?.totalRegistros ?? 0;
    return {
      data: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
