import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  VeiculoOsHistorico,
  VeiculoCustoAnalise,
  VeiculoRetrabalho,
} from '../../types/TCFOSCAB';
import {
  getVeiculoHistorico,
  getVeiculoCustos,
  getVeiculoRetrabalho,
} from '../../sql-queries/TCFOSCAB/veiculo';
import {
  HistoricoQueryOptions,
  CustosQueryOptions,
  Pagination,
} from './veiculo-manutencao-types';

export class VeiculoManutencaoListService {
  constructor(private qe: QueryExecutor) {}

  async getHistorico(
    codveiculo: number,
    options: HistoricoQueryOptions,
  ): Promise<{ data: VeiculoOsHistorico[]; pagination: Pagination }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const sql = getVeiculoHistorico
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace(/@status/g, options.status ?? 'NULL')
      .replace(/@tipo/g, options.tipo ?? 'NULL')
      .replace(/@dataInicio/g, options.dataInicio ? `'${options.dataInicio}'` : 'NULL')
      .replace(/@dataFim/g, options.dataFim ? `'${options.dataFim}'` : 'NULL')
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const result = await this.qe.executeQuery<{
      nuos: number;
      dataAbertura: Date | null;
      dataInicio: Date | null;
      dataFin: Date | null;
      status: string | null;
      statusLabel: string | null;
      statusGig: string | null;
      tipoManutencao: string | null;
      tipoManutencaoLabel: string | null;
      km: number | null;
      horimetro: number | null;
      custoTotal: number;
      diasAberto: number | null;
      isRetrabalho: number;
    }>(sql);

    const data: VeiculoOsHistorico[] = result.map((row) => ({
      nuos: row.nuos,
      dataAbertura: row.dataAbertura,
      dataInicio: row.dataInicio,
      dataFin: row.dataFin,
      status: row.status,
      statusLabel: row.statusLabel,
      statusGig: row.statusGig,
      tipoManutencao: row.tipoManutencao,
      tipoManutencaoLabel: row.tipoManutencaoLabel,
      km: row.km,
      horimetro: row.horimetro,
      custoTotal: row.custoTotal,
      diasAberto: row.diasAberto,
      isRetrabalho: row.isRetrabalho === 1,
    }));

    const total = await this.getVeiculoOsTotalCount(codveiculo, options);

    return {
      data,
      pagination: { page, limit, total },
    };
  }

  private async getVeiculoOsTotalCount(
    codveiculo: number,
    options: HistoricoQueryOptions,
  ): Promise<number> {
    const sql = `
      SELECT COUNT(*) as total
      FROM TCFOSCAB os
      WHERE os.CODVEICULO = ${codveiculo}
        AND (@status IS NULL OR os.STATUS = @status)
        AND (@tipo IS NULL OR os.MANUTENCAO = @tipo)
        AND (@dataInicio IS NULL OR os.DTABERTURA >= @dataInicio)
        AND (@dataFim IS NULL OR os.DTABERTURA <= @dataFim)
    `.replace('@status', options.status ?? 'NULL')
      .replace('@tipo', options.tipo ?? 'NULL')
      .replace('@dataInicio', options.dataInicio ? `'${options.dataInicio}'` : 'NULL')
      .replace('@dataFim', options.dataFim ? `'${options.dataFim}'` : 'NULL');

    const result = await this.qe.executeQuery<{ total: number }>(sql);
    return result[0]?.total ?? 0;
  }

  async getCustos(
    codveiculo: number,
    options: CustosQueryOptions,
  ): Promise<{ data: VeiculoCustoAnalise[]; pagination: Pagination }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;
    const offset = (page - 1) * limit;

    const sql = getVeiculoCustos
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace(/@dataInicio/g, options.dataInicio ? `'${options.dataInicio}'` : 'NULL')
      .replace(/@dataFim/g, options.dataFim ? `'${options.dataFim}'` : 'NULL')
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const result = await this.qe.executeQuery<{
      ano: number;
      mes: number;
      tipoManutencao: string | null;
      tipoManutencaoLabel: string | null;
      totalOs: number;
      custoTotal: number;
      custoMedio: number;
    }>(sql);

    const data: VeiculoCustoAnalise[] = result.map((row) => ({
      ano: row.ano,
      mes: row.mes,
      tipoManutencao: row.tipoManutencao,
      tipoManutencaoLabel: row.tipoManutencaoLabel,
      totalOs: row.totalOs,
      custoTotal: row.custoTotal,
      custoMedio: row.custoMedio,
    }));

    return {
      data,
      pagination: { page, limit, total: data.length },
    };
  }

  async getRetrabalho(
    codveiculo: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: VeiculoRetrabalho[]; pagination: Pagination }> {
    const offset = (page - 1) * limit;

    const sql = getVeiculoRetrabalho
      .replace(/@codveiculo/g, codveiculo.toString())
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const result = await this.qe.executeQuery<{
      nuos: number;
      osOrigem: number | null;
      dataAbertura: Date | null;
      dataFin: Date | null;
      tipoManutencao: string | null;
      custoTotal: number;
    }>(sql);

    const data: VeiculoRetrabalho[] = result.map((row) => ({
      nuos: row.nuos,
      osOrigem: row.osOrigem,
      dataAbertura: row.dataAbertura,
      dataFin: row.dataFin,
      tipoManutencao: row.tipoManutencao,
      custoTotal: row.custoTotal,
      motivoRetrabalho: null,
    }));

    return {
      data,
      pagination: { page, limit, total: data.length },
    };
  }
}
