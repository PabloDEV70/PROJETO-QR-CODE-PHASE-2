import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import * as Q from '../../sql-queries/TGFSER';
import { cache, CACHE_TTL } from '../../shared/cache';
import { escapeSqlString } from '../../shared/sql-sanitize';

export class SeriesService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getProdutosComSeries() {
    const ck = 'series:produtos';
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery(Q.resumoPorProduto);
    cache.set(ck, rows, 5 * 60 * 1000);
    return rows;
  }

  async getSeriesPorProduto(codProd: number) {
    const sql = Q.listarSeriesPorProduto.replace(/@CODPROD/g, String(codProd));
    return this.qe.executeQuery(sql);
  }

  async getHistoricoSerie(codProd: number, serie: string) {
    const safeSerie = escapeSqlString(serie);
    const sql = Q.historicoSerie
      .replace(/@CODPROD/g, String(codProd))
      .replace(/@SERIE/g, safeSerie);
    return this.qe.executeQuery(sql);
  }

  async buscarSerie(search: string) {
    const safe = escapeSqlString(search.replace(/[%_[\]]/g, ''));
    const sql = Q.buscarSerie.replace(/@SEARCH/g, safe);
    return this.qe.executeQuery(sql);
  }

  async getColaboradoresComMateriais() {
    const ck = 'series:empenhados:colaboradores';
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const rows = await this.qe.executeQuery(Q.colaboradoresComMateriais);
    cache.set(ck, rows, 5 * 60 * 1000);
    return rows;
  }

  async getMateriaisDoUsuario(codusu: number) {
    const ck = `series:empenhados:usu:${codusu}`;
    const cached = cache.get<unknown[]>(ck);
    if (cached) return cached;

    const sql = Q.materiaisDoUsuario.replace(/@CODUSU/g, String(codusu));
    const rows = await this.qe.executeQuery(sql);
    cache.set(ck, rows, 2 * 60 * 1000);
    return rows;
  }

  async getMateriaisDoParceiro(codparc: number) {
    const sql = Q.materiaisDoParceiro.replace(/@CODPARC/g, String(codparc));
    return this.qe.executeQuery(sql);
  }
}
