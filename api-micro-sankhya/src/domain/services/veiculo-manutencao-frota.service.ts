import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  FrotaStatusResponse,
  FrotaStatusResumo,
  FrotaStatusPorStatus,
} from '../../types/TCFOSCAB';
import {
  getFrotaResumo,
  getFrotaStatusPorStatus,
  getManutencoesUrgentes,
} from '../../sql-queries/TCFOSCAB/veiculo';
import { FrotaStatusQueryOptions, Pagination } from './veiculo-manutencao-types';

export class VeiculoManutencaoFrotaService {
  constructor(private qe: QueryExecutor) {}

  async getFrotaStatus(options: FrotaStatusQueryOptions): Promise<FrotaStatusResponse> {
    const resumoResult = await this.qe.executeQuery<FrotaStatusResumo>(getFrotaResumo);
    const resumo = resumoResult[0];
    const totalVeiculos = resumo?.totalVeiculos ?? 0;

    const statusResult = await this.qe.executeQuery<{
      status: string;
      count: number;
    }>(getFrotaStatusPorStatus);

    const porStatus: FrotaStatusPorStatus[] = statusResult.map((row) => ({
      status: row.status,
      count: row.count,
      percent: totalVeiculos > 0
        ? parseFloat((row.count * 100 / totalVeiculos).toFixed(2))
        : 0,
      veiculos: [],
    }));

    const urgentesResult = await this.getManutencoesUrgentes(1, 10);

    return {
      resumo: {
        totalVeiculos: resumo?.totalVeiculos ?? 0,
        operacionais: resumo?.operacionais ?? 0,
        emManutencao: resumo?.emManutencao ?? 0,
        bloqueados: resumo?.bloqueados ?? 0,
        percentualOperacional: resumo?.percentualOperacional ?? 0,
      },
      porStatus,
      manutencoesUrgentes: urgentesResult.data,
    };
  }

  async getManutencoesUrgentes(page: number = 1, limit: number = 20): Promise<{
    data: Array<{
      codveiculo: number;
      placa: string;
      adTag: string | null;
      diasAberto: number;
      statusGig: string | null;
    }>;
    pagination: Pagination;
  }> {
    const offset = (page - 1) * limit;

    const sql = getManutencoesUrgentes
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    const result = await this.qe.executeQuery<{
      codveiculo: number;
      placa: string | null;
      adTag: string | null;
      diasAberto: number;
      statusGig: string | null;
    }>(sql);

    const data = result.map((row) => ({
      codveiculo: row.codveiculo,
      placa: row.placa ?? '',
      adTag: row.adTag,
      diasAberto: row.diasAberto,
      statusGig: row.statusGig,
    }));

    return {
      data,
      pagination: { page, limit, total: result.length },
    };
  }
}
