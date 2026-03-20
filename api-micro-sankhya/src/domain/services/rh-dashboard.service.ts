import { RhRequisicoesResumoService, ResumoParams } from './rh-requisicoes-resumo.service';
import { RhFeriasService, FeriasParams } from './rh-ferias.service';
import { RhOcorrenciasService, OcorrenciaParams } from './rh-ocorrencias.service';
import { RequisicaoResumo } from '../../types/TFPREQ';
import { Ferias, FeriasResumo } from '../../types/TFPFER';
import { Ocorrencia, OcorrenciaResumo } from '../../types/TFPOCO';

export interface DashboardParams {
  codemp?: number;
  coddep?: number;
  dataInicio?: string;
  dataFim?: string;
}

export interface RhDashboard {
  requisicoes: RequisicaoResumo;
  ferias: {
    resumo: FeriasResumo;
    emFeriasAgora: Ferias[];
    proximas: Ferias[];
  };
  ocorrencias: {
    resumo: OcorrenciaResumo;
    ativas: Ocorrencia[];
  };
}

export class RhDashboardService {
  private requisicaoResumoService: RhRequisicoesResumoService;
  private feriasService: RhFeriasService;
  private ocorrenciasService: RhOcorrenciasService;

  constructor() {
    this.requisicaoResumoService = new RhRequisicoesResumoService();
    this.feriasService = new RhFeriasService();
    this.ocorrenciasService = new RhOcorrenciasService();
  }

  async getDashboard(params?: DashboardParams): Promise<RhDashboard> {
    const resumoParams: ResumoParams = {
      codemp: params?.codemp,
      coddep: params?.coddep,
      dataInicio: params?.dataInicio,
      dataFim: params?.dataFim,
    };
    const filterParams: FeriasParams & OcorrenciaParams = {
      codemp: params?.codemp,
      coddep: params?.coddep,
    };

    const [
      requisicoes,
      feriasResumo,
      feriasAtuais,
      feriasProximas,
      ocorrenciasResumo,
      ocorrenciasAtivas,
    ] = await Promise.all([
      this.requisicaoResumoService.getResumo(resumoParams),
      this.feriasService.getResumo(),
      this.feriasService.getFeriasAtuais(filterParams),
      this.feriasService.getFeriasProximas(30, filterParams),
      this.ocorrenciasService.getResumo(filterParams),
      this.ocorrenciasService.getOcorrenciasAtivas(filterParams),
    ]);

    return {
      requisicoes,
      ferias: {
        resumo: feriasResumo,
        emFeriasAgora: feriasAtuais,
        proximas: feriasProximas,
      },
      ocorrencias: {
        resumo: ocorrenciasResumo,
        ativas: ocorrenciasAtivas,
      },
    };
  }
}
