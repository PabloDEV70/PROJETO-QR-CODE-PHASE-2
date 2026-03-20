import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { TsiUsu, TsiUsuListOptions, TsiUsuSearchResult } from '../../types/TSIUSU';
import * as Q from '../../sql-queries/TSIUSU';
import { escapeSqlLike } from '../../shared/sql-sanitize';

export class UsuariosService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getById(codusu: number): Promise<TsiUsu | null> {
    const sql = Q.buscarPorId.replace('@codusu', codusu.toString());
    const rows = await this.queryExecutor.executeQuery<TsiUsu>(sql);
    return rows[0] || null;
  }

  async search(term: string, ativo: 'S' | 'N' = 'S', departamento?: string): Promise<TsiUsuSearchResult[]> {
    const searchClause = term
      ? `AND (
        CAST(u.NOMEUSU AS VARCHAR(100)) LIKE ${escapeSqlLike(term)}
        OR CAST(u.EMAIL AS VARCHAR(100)) LIKE ${escapeSqlLike(term)}
        OR CAST(p.NOMEPARC AS VARCHAR(MAX)) LIKE ${escapeSqlLike(term)}
      )`
      : '';
    const ativoClause = ativo === 'S'
      ? 'AND (u.DTLIMACESSO IS NULL OR u.DTLIMACESSO >= GETDATE())'
      : 'AND u.DTLIMACESSO IS NOT NULL AND u.DTLIMACESSO < GETDATE()';

    let deptClause = '';
    if (departamento) {
      deptClause = `AND CAST(f.DESCRDEP AS VARCHAR(100)) LIKE ${escapeSqlLike(departamento)}`;
    }
    
    const sql = Q.pesquisar
      .replace('-- @ATIVO', ativoClause)
      .replace('-- @SEARCH', searchClause)
      .replace('-- @DEPARTAMENTO', deptClause);
    return this.queryExecutor.executeQuery<TsiUsuSearchResult>(sql);
  }

  async list(options: TsiUsuListOptions): Promise<TsiUsu[]> {
    const { page, limit, ativo, codemp, orderBy = 'NOMEUSU', orderDir = 'ASC' } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (ativo === 'S') {
      conditions.push(`(u.DTLIMACESSO IS NULL OR u.DTLIMACESSO >= GETDATE())`);
    } else if (ativo === 'N') {
      conditions.push(`u.DTLIMACESSO IS NOT NULL AND u.DTLIMACESSO < GETDATE()`);
    }
    if (codemp) {
      conditions.push(`u.CODEMP = ${codemp}`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const allowedSorts = ['NOMEUSU', 'EMAIL', 'CODUSU', 'ATIVO'];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `u.${orderBy}` : 'u.NOMEUSU';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<TsiUsu>(sql);
  }
}
