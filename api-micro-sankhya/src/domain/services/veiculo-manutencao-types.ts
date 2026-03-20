import {
  VeiculoDashboardCompleto,
  VeiculoOsHistorico,
  VeiculoPlanoManutencao,
  VeiculoCustoAnalise,
  VeiculoRetrabalho,
  FrotaStatusResponse,
} from '../../types/TCFOSCAB';

export interface HistoricoQueryOptions {
  status?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface CustosQueryOptions {
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export interface FrotaStatusQueryOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface VeiculoManutencaoService {
  getDashboard(codveiculo: number): Promise<VeiculoDashboardCompleto | null>;
  getProximaManutencao(codveiculo: number): Promise<VeiculoPlanoManutencao | null>;
  getHistorico(
    codveiculo: number,
    options: HistoricoQueryOptions,
  ): Promise<{ data: VeiculoOsHistorico[]; pagination: Pagination }>;
  getCustos(
    codveiculo: number,
    options: CustosQueryOptions,
  ): Promise<{ data: VeiculoCustoAnalise[]; pagination: Pagination }>;
  getAderenciaPlano(
    codveiculo: number,
  ): Promise<{ scoreAderencia: number | null; totalOs: number; osNoPrazo: number } | null>;
  getRetrabalho(
    codveiculo: number,
    page?: number,
    limit?: number,
  ): Promise<{ data: VeiculoRetrabalho[]; pagination: Pagination }>;
  getFrotaStatus(options: FrotaStatusQueryOptions): Promise<FrotaStatusResponse>;
  getManutencoesUrgentes(page?: number, limit?: number): Promise<{
    data: Array<{
      codveiculo: number;
      placa: string;
      adTag: string | null;
      diasAberto: number;
      statusGig: string | null;
    }>;
    pagination: Pagination;
  }>;
}
