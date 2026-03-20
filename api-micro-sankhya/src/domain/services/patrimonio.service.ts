import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { logger } from '../../shared/logger';
import { escapeSqlString } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/PATRIMONIO';
import type {
  PatrimonioDashboard,
  PatrimonioBemListItem,
  PatrimonioBemDetalhe,
  PatrimonioMobilizacaoItem,
  PatrimonioLocalizacaoItem,
  PatrimonioDocumentoItem,
  PatrimonioOsHistoricoItem,
  PatrimonioValorPorCategoria,
  PatrimonioIdadeFrota,
  PatrimonioTopCliente,
  PatrimonioTimelineAquisicao,
  PatrimonioDepreciacaoBem,
  PatrimonioMobilizacaoCliente,
  PatrimonioMobilizacaoVeiculo,
  PatrimonioDepreciacaoConsolidada,
  PatrimonioCategoriaResumo,
  PatrimonioListFilters,
} from '../../types/PATRIMONIO/patrimonio-types';

export class PatrimonioService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  private async safeVal(label: string, sql: string): Promise<number> {
    try {
      const rows = await this.qe.executeQuery<{ val: number }>(sql);
      const val = rows[0]?.val ?? 0;
      logger.info('[Patrimonio] KPI %s = %d', label, val);
      return val;
    } catch (err) {
      logger.error('[Patrimonio] KPI %s FAILED: %s', label, err instanceof Error ? err.message : String(err));
      return 0;
    }
  }

  async getDashboard(): Promise<PatrimonioDashboard> {
    const [
      totalBens, valorPatrimonio, mobilizados, totalVeiculos,
      semPatrimonio, totalBaixados, alertasComissionamento,
      valorCat, idade, topCli, timeline,
    ] = await Promise.all([
      this.safeVal('totalBens', Q.kpiTotalBens),
      this.safeVal('valorPatrimonio', Q.kpiValorPatrimonio),
      this.safeVal('mobilizados', Q.kpiMobilizados),
      this.safeVal('totalVeiculos', Q.kpiTotalVeiculos),
      this.safeVal('semPatrimonio', Q.kpiSemPatrimonio),
      this.safeVal('totalBaixados', Q.kpiTotalBaixados),
      this.safeVal('alertasComissionamento', Q.kpiAlertasComissionamento),
      this.qe.executeQuery<PatrimonioValorPorCategoria>(Q.valorPorCategoria).catch(() => []),
      this.qe.executeQuery<PatrimonioIdadeFrota>(Q.idadeFrota).catch(() => []),
      this.qe.executeQuery<PatrimonioTopCliente>(Q.topClientes).catch(() => []),
      this.qe.executeQuery<PatrimonioTimelineAquisicao>(Q.timelineAquisicoes).catch(() => []),
    ]);

    return {
      kpis: {
        totalBens,
        valorPatrimonio,
        mobilizados,
        disponiveis: totalVeiculos - mobilizados,
        semPatrimonio,
        alertasComissionamento,
        totalVeiculos,
        totalBaixados,
      },
      valorPorCategoria: valorCat,
      idadeFrota: idade,
      topClientes: topCli,
      timelineAquisicoes: timeline,
    };
  }

  async listBens(filters: PatrimonioListFilters): Promise<PatrimonioBemListItem[]> {
    const [bens, semPat] = await Promise.all([
      this.qe.executeQuery<PatrimonioBemListItem>(Q.listaBens).catch((err) => {
        logger.error('[Patrimonio] listaBens FAILED: %s', err instanceof Error ? err.message : String(err));
        return [];
      }),
      this.qe.executeQuery<PatrimonioBemListItem>(Q.listaSemPatrimonio).catch((err) => {
        logger.error('[Patrimonio] listaSemPatrimonio FAILED: %s', err instanceof Error ? err.message : String(err));
        return [];
      }),
    ]);

    let all = [...bens, ...semPat].map(r => ({
      ...r,
      mobilizado: !!r.mobilizado,
      temPatrimonio: !!r.temPatrimonio,
    }));

    if (filters.search) {
      const term = filters.search.toLowerCase();
      all = all.filter(r =>
        (r.tag && r.tag.toLowerCase().includes(term)) ||
        (r.placa && r.placa.toLowerCase().includes(term)) ||
        (r.descricaoAbreviada && r.descricaoAbreviada.toLowerCase().includes(term)) ||
        (r.codbem && r.codbem.toLowerCase().includes(term)),
      );
    }
    if (filters.categoria && filters.categoria !== 'todos') {
      all = all.filter(r => r.categoria === filters.categoria);
    }
    if (filters.status === 'ativo') {
      all = all.filter(r => !r.dtBaixa);
    }
    if (filters.status === 'baixado') {
      all = all.filter(r => !!r.dtBaixa);
    }
    if (filters.mobilizado === 'sim') {
      all = all.filter(r => r.mobilizado);
    }
    if (filters.mobilizado === 'nao') {
      all = all.filter(r => !r.mobilizado);
    }
    if (filters.temPatrimonio === 'sim') {
      all = all.filter(r => r.temPatrimonio);
    }
    if (filters.temPatrimonio === 'nao') {
      all = all.filter(r => !r.temPatrimonio);
    }
    if (filters.empresa) {
      all = all.filter(r => r.empresa === filters.empresa);
    }

    return all;
  }

  async getBemDetalhe(codbem: string, codprod: number): Promise<PatrimonioBemDetalhe | null> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemDetalhe
      .replace(/@codbem/g, safe)
      .replace(/@codprod/g, String(codprod));
    const rows = await this.qe.executeQuery<PatrimonioBemDetalhe>(query);
    return rows[0] || null;
  }

  async getBemMobilizacao(codbem: string): Promise<PatrimonioMobilizacaoItem[]> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemMobilizacao.replace(/@codbem/g, safe);
    return this.qe.executeQuery<PatrimonioMobilizacaoItem>(query);
  }

  async getBemLocalizacao(codbem: string): Promise<PatrimonioLocalizacaoItem[]> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemLocalizacao.replace(/@codbem/g, safe);
    return this.qe.executeQuery<PatrimonioLocalizacaoItem>(query);
  }

  async getBemDocumentos(codbem: string): Promise<PatrimonioDocumentoItem[]> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemDocumentos.replace(/@codbem/g, safe);
    return this.qe.executeQuery<PatrimonioDocumentoItem>(query);
  }

  async getBemOsHistorico(codbem: string): Promise<PatrimonioOsHistoricoItem[]> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemOsHistorico.replace(/@codbem/g, safe);
    return this.qe.executeQuery<PatrimonioOsHistoricoItem>(query);
  }

  async getBemDepreciacao(codbem: string, codprod: number): Promise<PatrimonioDepreciacaoBem | null> {
    const safe = escapeSqlString(codbem.substring(0, 30));
    const query = Q.bemDepreciacao
      .replace(/@codbem/g, safe)
      .replace(/@codprod/g, String(codprod));
    const rows = await this.qe.executeQuery<PatrimonioDepreciacaoBem>(query);
    return rows[0] || null;
  }

  async getMobilizacaoPorCliente(): Promise<PatrimonioMobilizacaoCliente[]> {
    const rows = await this.qe.executeQuery<PatrimonioMobilizacaoVeiculo>(Q.mobilizacaoPorCliente);
    const map = new Map<number, PatrimonioMobilizacaoCliente>();

    for (const r of rows) {
      if (!map.has(r.codparc)) {
        map.set(r.codparc, {
          codparc: r.codparc,
          cliente: r.cliente,
          veiculos: [],
          totalVeiculos: 0,
          valorPatrimonio: 0,
        });
      }
      const group = map.get(r.codparc)!;
      group.veiculos.push(r);
      group.totalVeiculos++;
      group.valorPatrimonio += r.vlrAquisicao || 0;
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalVeiculos - a.totalVeiculos);
  }

  async getMobilizacaoPorVeiculo(): Promise<PatrimonioMobilizacaoVeiculo[]> {
    return this.qe.executeQuery<PatrimonioMobilizacaoVeiculo>(Q.mobilizacaoPorVeiculo);
  }

  async getDepreciacaoConsolidada(): Promise<PatrimonioDepreciacaoConsolidada[]> {
    return this.qe.executeQuery<PatrimonioDepreciacaoConsolidada>(Q.depreciacaoConsolidada);
  }

  async getCategoriasResumo(): Promise<PatrimonioCategoriaResumo[]> {
    return this.qe.executeQuery<PatrimonioCategoriaResumo>(Q.categoriasResumo);
  }
}
