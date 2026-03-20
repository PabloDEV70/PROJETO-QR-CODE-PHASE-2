import type {
  ListaAuditoria,
  EstatisticasAuditoria,
  AuditoriaFilters,
} from '@/types/database-types';
import { esc, queryRows } from '@/api/database-queries';

// ── Audit (via SQL on AD_GIG_LOG) ─────────────────────
export async function getAuditHistorico(
  filters?: AuditoriaFilters,
): Promise<ListaAuditoria> {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const offset = (page - 1) * limit;

  const where: string[] = ['1=1'];
  if (filters?.tabela) where.push(`TABELA = '${esc(filters.tabela)}'`);
  if (filters?.usuario) where.push(`NOMEUSU LIKE '%${esc(filters.usuario)}%'`);
  if (filters?.operacao) where.push(`ACAO = '${esc(filters.operacao)}'`);
  const w = where.join(' AND ');

  const [countRows, rows] = await Promise.all([
    queryRows(`SELECT COUNT(*) AS total FROM AD_GIG_LOG WHERE ${w}`),
    queryRows(
      `SELECT * FROM (`
      + `SELECT ID, ACAO, TABELA, CODUSU, NOMEUSU, DTCREATED,`
      + ` ROW_NUMBER() OVER (ORDER BY ID DESC) AS RowNum`
      + ` FROM AD_GIG_LOG WHERE ${w}`
      + `) T WHERE RowNum > ${offset} AND RowNum <= ${offset + limit}`,
    ),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  return {
    data: rows as unknown as ListaAuditoria['data'],
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  };
}

export async function getAuditEstatisticas(
  params?: { tabela?: string },
): Promise<EstatisticasAuditoria> {
  try {
    const w = params?.tabela ? `WHERE TABELA = '${esc(params.tabela)}'` : '';
    const [countRows, groupRows] = await Promise.all([
      queryRows(`SELECT COUNT(*) AS total FROM AD_GIG_LOG ${w}`),
      queryRows(`SELECT ACAO, COUNT(*) AS cnt FROM AD_GIG_LOG ${w} GROUP BY ACAO`),
    ]);
    const porOperacao: Record<string, number> = {};
    for (const r of groupRows) porOperacao[String(r.ACAO)] = Number(r.cnt);
    return { totalRegistros: Number(countRows[0]?.total ?? 0), porOperacao };
  } catch {
    return { totalRegistros: 0, porOperacao: {} };
  }
}
