// =============================================================================
// AD_APONTAMENTO - Tipos e Interfaces
// Sistema de Apontamentos de Manutenção
// =============================================================================

// Status de Ordem de Serviço do Apontamento
export type StatusOS = 'MA' | 'AN' | 'AV' | 'SN';

export const StatusOSLabels: Record<StatusOS, string> = {
  MA: 'Manutenção',
  AN: 'Em Análise',
  AV: 'Aprovado',
  SN: 'Sem Necessidade',
};

export type TipoServico = 'S' | 'N';

// Interface base do Apontamento
export interface Apontamento {
  CODIGO: number;
  CODUSU: number;
  CODVEICULO: number | null;
  KM: number | null;
  HORIMETRO: number | null;
  DTINCLUSAO: Date;
  BORRCHARIA: TipoServico | null;
  ELETRICA: TipoServico | null;
  FUNILARIA: TipoServico | null;
  MECANICA: TipoServico | null;
  CALDEIRARIA: TipoServico | null;
  OBS: string | null;
  OSEXTERNA: TipoServico | null;
  OPEXTERNO: string | null;
  DTPROGRAMACAO: Date | null;
  NUOS: number | null;
  TAG: string | null;
  STATUSOS: StatusOS | null;
}

// Apontamento com dados do veículo
export interface ApontamentoCompleto extends Apontamento {
  PLACA: string | null;
  MARCAMODELO: string | null;
  NOMEUSU: string | null;
  statusOsLabel: string | null;
  totalServicos: number;
  totalChecklists: number;
}

// Apontamento na listagem
export interface ApontamentoListItem {
  CODIGO: number;
  DTINCLUSAO: Date;
  STATUSOS: StatusOS | null;
  statusOsLabel: string | null;
  NUOS: number | null;
  TAG: string | null;
  CODVEICULO: number | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  NOMEUSU: string | null;
  tiposServico: string;
  totalServicos: number;
}

// Dashboard de Status
export interface ApontamentoDashboardStatus {
  STATUSOS: StatusOS | null;
  descricao: string;
  total: number;
  percentual: number;
}

// Dashboard de Tipos de Serviço
export interface ApontamentoDashboardTipos {
  tipo: string;
  total: number;
  percentual: number;
}

// Dashboard Completo
export interface ApontamentoDashboard {
  totais: {
    apontamentos: number;
    servicos: number;
    mediaServicosPorApontamento: number;
    apontamentosComOs: number;
    percentualConvertidoOs: number;
    checklists: number;
    checklistsPendentes: number;
  };
  porStatus: ApontamentoDashboardStatus[];
  porTipoServico: ApontamentoDashboardTipos[];
  ultimosDias: {
    data: string;
    novos: number;
  }[];
}

// Inconsistências
export interface ApontamentoInconsistencia {
  CODIGO: number;
  DTINCLUSAO: Date;
  CODUSU: number;
  NOMEUSU: string | null;
  tipoProblema: 'SEM_VEICULO_E_TAG' | 'SEM_VEICULO' | 'SEM_STATUS' | 'OUTRO';
}

// Opções de listagem
export interface ListApontamentosOptions {
  page: number;
  limit: number;
  status?: StatusOS;
  codveiculo?: number;
  dataInicio?: string;
  dataFim?: string;
  comOs?: boolean;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

// Resposta da listagem
export interface ApontamentoListResponse {
  data: ApontamentoListItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
