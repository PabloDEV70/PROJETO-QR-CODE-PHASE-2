import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import { OsCompleta, OsItem, OsStats, ListOsComercialOptions } from '../../types/TCSOSE';
import * as Q from '../../sql-queries/TCSOSE';

export class OsComercialService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getById(numos: number): Promise<OsCompleta | null> {
    const sql = Q.buscarPorId.replace('@numos', numos.toString());
    const rows = await this.queryExecutor.executeQuery<OsCompleta>(sql);
    return rows[0] || null;
  }

  async search(term: string): Promise<OsCompleta[]> {
    const sanitizedTerm = escapeSqlString(term);
    const sql = Q.pesquisar.replace(/@sanitizedTerm/g, sanitizedTerm);
    return this.queryExecutor.executeQuery<OsCompleta>(sql);
  }

  async list(options: ListOsComercialOptions): Promise<OsCompleta[]> {
    const {
      page,
      limit,
      situacao,
      dataInicio,
      dataFim,
      codparc,
      exibeDash,
      orderBy = 'DHCHAMADA',
      orderDir = 'DESC',
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (situacao) {
      conditions.push(`os.SITUACAO = '${escapeSqlString(situacao)}'`);
    }
    if (dataInicio) {
      conditions.push(`os.DHCHAMADA >= ${escapeSqlDate(dataInicio)}`);
    }
    if (dataFim) {
      conditions.push(`os.DHCHAMADA <= ${escapeSqlDate(dataFim)}`);
    }
    if (codparc) {
      conditions.push(`os.CODPARC = ${codparc}`);
    }
    if (exibeDash) {
      conditions.push(`os.AD_EXIBEDASH = '${exibeDash}'`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const allowedSorts = ['NUMOS', 'DHCHAMADA', 'DTFECHAMENTO', 'SITUACAO', 'CODPARC'];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `os.${orderBy}` : 'os.DHCHAMADA';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<OsCompleta>(sql);
  }

  async getItens(numos: number): Promise<OsItem[]> {
    const sql = Q.itens.replace('@numos', numos.toString());
    return this.queryExecutor.executeQuery<OsItem>(sql);
  }

  async getByVeiculo(codveiculo: number, page: number, limit: number): Promise<OsCompleta[]> {
    const sql = Q.porVeiculo.replace('@codveiculo', codveiculo.toString());
    const allResults = await this.queryExecutor.executeQuery<OsCompleta>(sql);
    // Apply pagination in memory since SQL Server 2005 DISTINCT + ROW_NUMBER() is problematic
    const offset = (page - 1) * limit;
    return allResults.slice(offset, offset + limit);
  }

  async getByParceiro(codparc: number, page: number, limit: number): Promise<OsCompleta[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porParceiro
      .replace('@codparc', codparc.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<OsCompleta>(sql);
  }

  async getStats(): Promise<OsStats> {
    const [statsRow] = await this.queryExecutor.executeQuery<{
      totalOs: number;
      osAbertas: number;
      osFechadas: number;
      osCanceladas: number;
      mediaTempoSlaMinutos: number | null;
    }>(Q.estatisticas);

    const topClientes = await this.queryExecutor.executeQuery<{
      codparc: number;
      nomeParc: string | null;
      totalOs: number;
      osFechadas: number;
      osAbertas: number;
    }>(Q.topClientes);

    return {
      totalOs: statsRow.totalOs,
      osAbertas: statsRow.osAbertas,
      osFechadas: statsRow.osFechadas,
      osCanceladas: statsRow.osCanceladas,
      mediaTempoSlaMinutos: statsRow.mediaTempoSlaMinutos,
      topClientes,
    };
  }
}
