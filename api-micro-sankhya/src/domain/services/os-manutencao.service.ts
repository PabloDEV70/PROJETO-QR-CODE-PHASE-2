import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString, escapeSqlDate } from '../../shared/sql-sanitize';
import {
  OsCompleta,
  OsServico,
  OsStats,
  OsDashboard,
  OsPorStatus,
  OsPorTipoManutencao,
  OsRecente,
  ListOsManutencaoOptions,
  OsListResponse,
} from '../../types/TCFOSCAB';
import * as Q from '../../sql-queries/TCFOSCAB';

export class OsManutencaoService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getById(nuos: number): Promise<OsCompleta | null> {
    const sql = Q.buscarPorId.replace('@nuos', nuos.toString());
    const rows = await this.queryExecutor.executeQuery<OsCompleta>(sql);
    return rows[0] || null;
  }

  async search(term: string): Promise<OsCompleta[]> {
    const sanitizedTerm = escapeSqlString(term);
    const sql = Q.pesquisar.replace(/@sanitizedTerm/g, sanitizedTerm);
    return this.queryExecutor.executeQuery<OsCompleta>(sql);
  }

  async list(options: ListOsManutencaoOptions): Promise<OsListResponse> {
    const {
      page,
      limit,
      status,
      manutencao,
      adStatusGig,
      codveiculo,
      codparc,
      dataInicio,
      dataFim,
      orderBy = 'DTABERTURA',
      orderDir = 'DESC',
    } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    if (status) {
      conditions.push(`os.STATUS = '${escapeSqlString(status)}'`);
    }
    if (manutencao) {
      conditions.push(`os.MANUTENCAO = '${manutencao}'`);
    }
    if (adStatusGig) {
      conditions.push(`os.AD_STATUSGIG = '${escapeSqlString(adStatusGig)}'`);
    }
    if (codveiculo) {
      conditions.push(`os.CODVEICULO = ${codveiculo}`);
    }
    if (codparc) {
      conditions.push(`os.CODPARC = ${codparc}`);
    }
    if (dataInicio) {
      conditions.push(`os.DTABERTURA >= '${escapeSqlDate(dataInicio)}'`);
    }
    if (dataFim) {
      conditions.push(`os.DTABERTURA <= '${escapeSqlDate(dataFim)}'`);
    }

    const whereSql = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const countSql = Q.listarCount.replace('-- @WHERE', whereSql);
    const [countRow] = await this.queryExecutor.executeQuery<{
      totalRegistros: number;
    }>(countSql);

    const allowedSorts = [
      'NUOS', 'DTABERTURA', 'STATUS', 'MANUTENCAO', 'CODVEICULO', 'DATAFIN', 'PREVISAO',
    ];
    const safeOrderBy = allowedSorts.includes(orderBy) ? `os.${orderBy}` : 'os.DTABERTURA';
    const orderSql = `${safeOrderBy} ${orderDir}`;

    const sql = Q.listar
      .replace('-- @WHERE', whereSql)
      .replace('-- @ORDER', orderSql)
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const data = await this.queryExecutor.executeQuery<OsCompleta>(sql);

    return {
      data,
      meta: {
        page: options.page,
        limit: options.limit,
        totalRegistros: countRow.totalRegistros,
      },
    };
  }

  async getServicos(nuos: number): Promise<OsServico[]> {
    const sql = Q.servicos.replace('@nuos', nuos.toString());
    return this.queryExecutor.executeQuery<OsServico>(sql);
  }

  async getByVeiculo(codveiculo: number, page: number, limit: number): Promise<OsCompleta[]> {
    const offset = (page - 1) * limit;
    const sql = Q.porVeiculo
      .replace('@codveiculo', codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());
    return this.queryExecutor.executeQuery<OsCompleta>(sql);
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
      mediaDiasParaFechar: number | null;
    }>(Q.estatisticas);

    const topVeiculos = await this.queryExecutor.executeQuery<{
      codveiculo: number;
      placa: string | null;
      marcaModelo: string | null;
      totalOs: number;
    }>(Q.topVeiculos);

    return {
      totalOs: statsRow.totalOs,
      osAbertas: statsRow.osAbertas,
      osFechadas: statsRow.osFechadas,
      mediaDiasParaFechar: statsRow.mediaDiasParaFechar,
      topVeiculos,
    };
  }

  async getDashboard(): Promise<OsDashboard> {
    const [porStatus, porTipoManutencao, recentes, paraExibir] = await Promise.all([
      this.queryExecutor.executeQuery<OsPorStatus>(Q.dashboardPorStatus),
      this.queryExecutor.executeQuery<OsPorTipoManutencao>(Q.dashboardPorTipo),
      this.queryExecutor.executeQuery<OsRecente>(Q.dashboardRecentes),
      this.queryExecutor.executeQuery<OsRecente>(Q.dashboardExibir),
    ]);

    return {
      porStatus,
      porTipoManutencao,
      recentes,
      paraExibir,
    };
  }
}
