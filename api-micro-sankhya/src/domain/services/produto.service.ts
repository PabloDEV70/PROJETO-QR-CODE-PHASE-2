import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import {
  buscarProdutosLeve, produtoPorId, estoquePorProduto,
  placasPorProduto, gruposProduto,
} from '../../sql-queries/TGFPRO/buscar-produtos';
import { cache, CACHE_TTL } from '../../shared/cache';

export class ProdutoService {
  private qe = new QueryExecutor();

  /** Fast search — lightweight, no estoque subquery */
  async buscar(opts: { q?: string; grupo?: string; limit?: number; usoprod?: string }) {
    const limit = Math.min(opts.limit ?? 30, 50);
    const ck = `prod:busca:${opts.q ?? ''}:${opts.grupo ?? ''}:${opts.usoprod ?? ''}:${limit}`;
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const parts: string[] = [];
    if (opts.q) {
      const safe = escapeSqlString(opts.q.replace(/[%_[\]]/g, ''));
      parts.push(
        `AND (p.DESCRPROD LIKE '%${safe}%' OR CAST(p.CODPROD AS VARCHAR(10)) LIKE '%${safe}%'` +
        ` OR p.REFERENCIA LIKE '%${safe}%' OR p.MARCA LIKE '%${safe}%')`,
      );
    }
    if (opts.grupo) {
      parts.push(`AND p.CODGRUPOPROD = ${parseInt(opts.grupo, 10)}`);
    }
    if (opts.usoprod) {
      parts.push(`AND p.USOPROD = '${opts.usoprod === 'S' ? 'S' : 'P'}'`);
    }

    const sql = buscarProdutosLeve
      .replace('-- @WHERE', parts.join('\n'))
      .replace('@LIMIT', String(limit));

    const rows = await this.qe.executeQuery(sql);
    cache.set(ck, rows, CACHE_TTL.RDO_LIST);
    return rows;
  }

  /** Full product detail by ID — includes estoque summary */
  async getById(codProd: number) {
    const ck = `prod:id:${codProd}`;
    const cached = cache.get<unknown>(ck);
    if (cached) return cached;

    const sql = produtoPorId.replace(/@CODPROD/g, String(codProd));
    const rows = await this.qe.executeQuery(sql);
    const row = rows[0] ?? null;
    if (row) cache.set(ck, row, CACHE_TTL.RDO_LIST);
    return row;
  }

  /** Stock by location for a product */
  async getEstoque(codProd: number) {
    const ck = `prod:est:${codProd}`;
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const sql = estoquePorProduto.replace(/@CODPROD/g, String(codProd));
    const rows = await this.qe.executeQuery(sql);
    cache.set(ck, rows, CACHE_TTL.RDO_LIST);
    return rows;
  }

  /** Vehicles (plates) that used this product in OS */
  async getPlacas(codProd: number) {
    const ck = `prod:placas:${codProd}`;
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const sql = placasPorProduto.replace(/@CODPROD/g, String(codProd));
    const rows = await this.qe.executeQuery(sql);
    cache.set(ck, rows, 2 * 60_000); // 2 min
    return rows;
  }

  async getGrupos() {
    const ck = 'prod:grupos';
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery(gruposProduto);
    cache.set(ck, rows, 5 * 60_000);
    return rows;
  }
}
