import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  VeiculoDashboardCompleto,
  VeiculoPlanoManutencao,
  VeiculoCustoAnalise,
  StatusOperacional,
  StatusManutencao,
} from '../../types/TCFOSCAB';
import {
  getVeiculoDashboard,
  getVeiculoProximaManutencao,
  getVeiculoAderenciaPlano,
} from '../../sql-queries/TCFOSCAB/veiculo';
import { CustosQueryOptions } from './veiculo-manutencao-types';

export class VeiculoManutencaoDetailService {
  constructor(private qe: QueryExecutor) {}

  async getDashboard(codveiculo: number): Promise<VeiculoDashboardCompleto | null> {
    const result = await this.qe.executeQuery<{
      codveiculo: number;
      placa: string;
      adTag: string | null;
      marcaModelo: string;
      tipoEquipamento: string | null;
      kmAcum: number;
      statusOperacional: StatusOperacional;
      osAtivasCount: number;
      ultimaOsData: Date | null;
      ultimaOsKm: number | null;
      ultimaOsTipo: string | null;
      ultimaOsCusto: number | null;
      proprietarioNome: string | null;
      motoristaNome: string | null;
    }>(getVeiculoDashboard.replace('@codveiculo', codveiculo.toString()));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    const alerts: VeiculoDashboardCompleto['alertas'] = [];

    if (row.statusOperacional === 'BLOQUEADO') {
      alerts.push({
        tipo: 'BLOQUEIO',
        mensagem: 'Veiculo possui OS com bloqueio comercial',
        severidade: 'CRITICAL',
      });
    }

    if (row.statusOperacional === 'EM_MANUTENCAO') {
      alerts.push({
        tipo: 'ATRASO',
        mensagem: `Veiculo possui ${row.osAtivasCount} OS(s) ativa(s)`,
        severidade: 'WARNING',
      });
    }

    const dashboard: VeiculoDashboardCompleto = {
      veiculo: {
        codveiculo: row.codveiculo,
        placa: row.placa,
        adTag: row.adTag,
        marcaModelo: row.marcaModelo,
        tipoEquipamento: row.tipoEquipamento,
        kmAcum: row.kmAcum,
        proprietario: row.proprietarioNome
          ? { codparc: 0, nome: row.proprietarioNome }
          : undefined,
        motorista: row.motoristaNome
          ? { codparc: 0, nome: row.motoristaNome }
          : undefined,
      },
      statusOperacional: row.statusOperacional,
      osAtivasCount: row.osAtivasCount,
      ultimaManutencao: row.ultimaOsData
        ? {
            data: row.ultimaOsData.toISOString().split('T')[0],
            km: row.ultimaOsKm,
            tipo: row.ultimaOsTipo,
            custo: row.ultimaOsCusto,
          }
        : null,
      proximaManutencao: null,
      scoreAderencia: null,
      custos: {
        mesAtual: 0,
        ultimoMes: 0,
        acumuladoAno: 0,
        mediaMensal: 0,
      },
      alertas: alerts,
    };

    return dashboard;
  }

  async enrichDashboardWithCustos(
    dashboard: VeiculoDashboardCompleto,
    custosData: VeiculoCustoAnalise[],
  ): Promise<void> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    dashboard.custos = {
      mesAtual: custosData
        .filter((c) => c.mes === currentMonth && c.ano === currentYear)
        .reduce((sum, c) => sum + c.custoTotal, 0),
      ultimoMes: custosData
        .filter((c) => c.mes === lastMonth && c.ano === lastMonthYear)
        .reduce((sum, c) => sum + c.custoTotal, 0),
      acumuladoAno: custosData
        .filter((c) => c.ano === currentYear)
        .reduce((sum, c) => sum + c.custoTotal, 0),
      mediaMensal:
        custosData.filter((c) => c.ano === currentYear)
          .reduce((sum, c) => sum + c.custoTotal, 0) /
        (currentMonth > 0 ? currentMonth : 1),
    };
  }

  async getProximaManutencao(codveiculo: number): Promise<VeiculoPlanoManutencao | null> {
    const result = await this.qe.executeQuery<{
      nuplano: number;
      descricao: string;
      tipo: string | null;
      tipoLabel: string | null;
      intervaloDias: number | null;
      intervaloKm: number | null;
      percentualTolerancia: number | null;
      kmVeiculo: number;
      dataUltima: Date | null;
      kmUltima: number | null;
      statusManutencao: StatusManutencao;
      dataProxima: Date | null;
      kmProximo: number | null;
      diasAtraso: number | null;
      kmAtraso: number | null;
    }>(getVeiculoProximaManutencao.replace('@codveiculo', codveiculo.toString()));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];

    return {
      nuplano: row.nuplano,
      descricao: row.descricao,
      tipo: row.tipo,
      tipoLabel: row.tipoLabel,
      intervaloDias: row.intervaloDias,
      intervaloKm: row.intervaloKm,
      percentualTolerancia: row.percentualTolerancia,
      statusPlano:
        row.statusManutencao === 'ATRASADA'
          ? 'VENCIDO'
          : row.statusManutencao === 'PROXIMO_VENCER'
            ? 'PROXIMO_VENCER'
            : 'ATIVO',
      dataUltima: row.dataUltima,
      kmUltima: row.kmUltima,
      dataProxima: row.dataProxima,
      kmProximo: row.kmProximo,
      diasAtraso: row.diasAtraso,
      kmAtraso: row.kmAtraso,
      scoreAderencia: null,
    };
  }

  async getAderenciaPlano(
    codveiculo: number,
  ): Promise<{ scoreAderencia: number | null; totalOs: number; osNoPrazo: number } | null> {
    const result = await this.qe.executeQuery<{
      codveiculo: number;
      totalOs: number;
      osNoPrazo: number;
      scoreAderencia: number | null;
      mediaDiasAtraso: number | null;
      maxDiasAtraso: number | null;
    }>(getVeiculoAderenciaPlano.replace(/@codveiculo/g, codveiculo.toString()));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];

    return {
      scoreAderencia: row.scoreAderencia,
      totalOs: row.totalOs,
      osNoPrazo: row.osNoPrazo,
    };
  }
}
