import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  AdComadm,
  AdComadmResumo,
  ChatListItem,
  KanbanColumn,
  ListChamadosOptions,
  ListChamadosResult,
  UsuarioChamado,
} from '../../types/AD_COMADM';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import * as Q from '../../sql-queries/AD_COMADM';
import { buildWhereFilters, STATUS_MAP, PRIORIDADE_MAP, KANBAN_COLUMNS } from './chamados.helpers';

export class ChamadosService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getList(options: ListChamadosOptions): Promise<ListChamadosResult> {
    const { page, limit, orderBy = 'DHCHAMADO', orderDir = 'DESC' } = options;
    const offset = (page - 1) * limit;
    const whereSql = buildWhereFilters(options);
    const allowedSorts = ['DHCHAMADO', 'NUCHAMADO', 'STATUS', 'PRIORIDADE', 'DHFINCHAM'];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `A.${orderBy}` : 'A.DHCHAMADO';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const listSql = Q.getList
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const countSql = Q.getCount.replace('-- @WHERE', whereSql);

    const [data, countRows] = await Promise.all([
      this.qe.executeQuery<AdComadm>(listSql),
      this.qe.executeQuery<{ TOTAL: number }>(countSql),
    ]);

    return { data, total: countRows[0]?.TOTAL || 0 };
  }

  async getUsuarios(): Promise<UsuarioChamado[]> {
    const ck = cacheKey('chamados:usuarios');
    const cached = cache.get<UsuarioChamado[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery<UsuarioChamado>(Q.getUsuariosChamados);
    cache.set(ck, rows, CACHE_TTL.CHAMADOS);
    return rows;
  }

  async getById(nuchamado: number): Promise<AdComadm | null> {
    const sql = Q.getById.replace(/@nuchamado/g, nuchamado.toString());
    const rows = await this.qe.executeQuery<AdComadm>(sql);
    return rows[0] || null;
  }

  async getResumo(): Promise<AdComadmResumo> {
    const ck = cacheKey('chamados:resumo');
    const cached = cache.get<AdComadmResumo>(ck);
    if (cached) return cached;

    const [statusRows, prioRows, tipoRows, totalRows] = await Promise.all([
      this.qe.executeQuery<{ STATUS: string; TOTAL: number }>(Q.getResumoStatus),
      this.qe.executeQuery<{ PRIORIDADE: string; TOTAL: number }>(Q.getResumoPrioridade),
      this.qe.executeQuery<{ TIPOCHAMADO: string; TOTAL: number }>(Q.getResumoTipo),
      this.qe.executeQuery<{ TOTAL: number }>(Q.getResumoTotal),
    ]);

    const result: AdComadmResumo = {
      porStatus: statusRows.map((r) => ({
        status: r.STATUS,
        label: STATUS_MAP[r.STATUS] || r.STATUS,
        total: r.TOTAL,
      })),
      porPrioridade: prioRows.map((r) => ({
        prioridade: r.PRIORIDADE || '-',
        label: PRIORIDADE_MAP[r.PRIORIDADE] || 'Sem Prioridade',
        total: r.TOTAL,
      })),
      porTipo: tipoRows.map((r) => ({
        tipoChamado: r.TIPOCHAMADO || '-',
        total: r.TOTAL,
      })),
      total: totalRows[0]?.TOTAL || 0,
    };

    cache.set(ck, result, CACHE_TTL.CHAMADOS);
    return result;
  }

  async getKanban(options: Partial<ListChamadosOptions> = {}): Promise<KanbanColumn[]> {
    const whereSql = buildWhereFilters(options as ListChamadosOptions);
    const ck = cacheKey('chamados:kanban', { where: whereSql });
    const cached = cache.get<KanbanColumn[]>(ck);
    if (cached) return cached;

    // 3 parallel queries: active rows, closed F (top 20), closed C (top 20), counts
    const activeSql = Q.getKanban.replace('-- @WHERE', whereSql);
    const closedFSql = Q.getKanbanClosed.replace('@STATUS', 'F').replace('-- @WHERE', whereSql);
    const closedCSql = Q.getKanbanClosed.replace('@STATUS', 'C').replace('-- @WHERE', whereSql);
    const countsSql = Q.getKanbanCounts.replace('-- @WHERE', whereSql);

    const [activeRows, fRows, cRows, countRows] = await Promise.all([
      this.qe.executeQuery<AdComadm>(activeSql),
      this.qe.executeQuery<AdComadm>(closedFSql),
      this.qe.executeQuery<AdComadm>(closedCSql),
      this.qe.executeQuery<{ STATUS: string; TOTAL: number }>(countsSql),
    ]);

    const allRows = [...activeRows, ...fRows, ...cRows];
    const totalsMap = new Map(countRows.map((r) => [r.STATUS, r.TOTAL]));

    const columns: KanbanColumn[] = KANBAN_COLUMNS.map((col) => ({
      ...col,
      chamados: allRows.filter((r) => r.STATUS === col.status),
      total: totalsMap.get(col.status) || 0,
    }));

    cache.set(ck, columns, 30_000);
    return columns;
  }

  async getChatList(options: {
    status?: string;
    statusExclude?: string;
    search?: string;
    solicitante?: number;
    codgrupo?: number;
    scopeUser?: number;
    limit: number;
    offset: number;
  }): Promise<ChatListItem[]> {
    const whereSql = buildWhereFilters(options as unknown as ListChamadosOptions);
    const ck = cacheKey('chamados:chat-list', { where: whereSql, limit: options.limit, offset: options.offset });
    const cached = cache.get<ChatListItem[]>(ck);
    if (cached) return cached;

    const sql = Q.getChatList
      .replace('-- @WHERE', whereSql)
      .replace(/@OFFSET/g, options.offset.toString())
      .replace(/@LIMIT/g, options.limit.toString());

    const rows = await this.qe.executeQuery<ChatListItem>(sql);
    cache.set(ck, rows, 15_000);
    return rows;
  }
}
