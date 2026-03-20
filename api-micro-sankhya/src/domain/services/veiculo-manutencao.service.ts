import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { VeiculoDashboardCompleto } from '../../types/TCFOSCAB';
import { VeiculoManutencaoDetailService } from './veiculo-manutencao-detail.service';
import { VeiculoManutencaoListService } from './veiculo-manutencao-list.service';
import { VeiculoManutencaoFrotaService } from './veiculo-manutencao-frota.service';

export {
  HistoricoQueryOptions,
  CustosQueryOptions,
  FrotaStatusQueryOptions,
  VeiculoManutencaoService,
  Pagination,
} from './veiculo-manutencao-types';

export class VeiculoManutencaoServiceImpl {
  private detail: VeiculoManutencaoDetailService;
  private list: VeiculoManutencaoListService;
  private frota: VeiculoManutencaoFrotaService;

  constructor() {
    const qe = new QueryExecutor();
    this.detail = new VeiculoManutencaoDetailService(qe);
    this.list = new VeiculoManutencaoListService(qe);
    this.frota = new VeiculoManutencaoFrotaService(qe);

    this.getProximaManutencao = this.detail.getProximaManutencao.bind(this.detail);
    this.getHistorico = this.list.getHistorico.bind(this.list);
    this.getCustos = this.list.getCustos.bind(this.list);
    this.getAderenciaPlano = this.detail.getAderenciaPlano.bind(this.detail);
    this.getRetrabalho = this.list.getRetrabalho.bind(this.list);
    this.getFrotaStatus = this.frota.getFrotaStatus.bind(this.frota);
    this.getManutencoesUrgentes = this.frota.getManutencoesUrgentes.bind(this.frota);
  }

  async getDashboard(codveiculo: number) {
    const dashboard = await this.detail.getDashboard(codveiculo);
    if (!dashboard) return null;

    return this.enrichDashboard(dashboard, codveiculo);
  }

  private async enrichDashboard(
    dashboard: VeiculoDashboardCompleto,
    codveiculo: number,
  ): Promise<VeiculoDashboardCompleto> {
    const proxima = await this.detail.getProximaManutencao(codveiculo);
    if (proxima) {
      dashboard.proximaManutencao = {
        data: proxima.dataProxima?.toISOString().split('T')[0] ?? null,
        km: proxima.kmProximo ?? null,
        diasRestantes: null,
        status: proxima.statusPlano === 'VENCIDO'
          ? 'ATRASADA'
          : proxima.statusPlano === 'PROXIMO_VENCER'
            ? 'PROXIMO_VENCER'
            : 'EM_DIA',
      };
    }

    const aderencia = await this.detail.getAderenciaPlano(codveiculo);
    if (aderencia) {
      dashboard.scoreAderencia = aderencia.scoreAderencia;
    }

    const custos = await this.list.getCustos(codveiculo, {});
    this.detail.enrichDashboardWithCustos(dashboard, custos.data);

    return dashboard;
  }

  getProximaManutencao!: VeiculoManutencaoDetailService['getProximaManutencao'];
  getHistorico!: VeiculoManutencaoListService['getHistorico'];
  getCustos!: VeiculoManutencaoListService['getCustos'];
  getAderenciaPlano!: VeiculoManutencaoDetailService['getAderenciaPlano'];
  getRetrabalho!: VeiculoManutencaoListService['getRetrabalho'];
  getFrotaStatus!: VeiculoManutencaoFrotaService['getFrotaStatus'];
  getManutencoesUrgentes!: VeiculoManutencaoFrotaService['getManutencoesUrgentes'];
}

export const veiculoManutencaoService = new VeiculoManutencaoServiceImpl();
