export type StatusOS = 'MA' | 'AN' | 'AV' | 'SN';

export const STATUS_OS_LABELS: Record<StatusOS, string> = {
  MA: 'Manutencao',
  AN: 'Em Analise',
  AV: 'Aprovado',
  SN: 'Sem Necessidade',
};

export const STATUS_OS_COLORS: Record<StatusOS, 'warning' | 'info' | 'success' | 'default'> = {
  MA: 'warning',
  AN: 'info',
  AV: 'success',
  SN: 'default',
};

export type TipoServico = 'S' | 'N';

export interface ApontamentoListItem {
  CODIGO: number;
  CODVEICULO: number | null;
  CODUSU: number | null;
  KM: number | null;
  HORIMETRO: number | null;
  DTINCLUSAO: string | null;
  DTPROGRAMACAO: string | null;
  NUOS: number | null;
  TAG: string | null;
  STATUSOS: StatusOS | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  NOMEUSU: string | null;
  BORRCHARIA: TipoServico | null;
  ELETRICA: TipoServico | null;
  FUNILARIA: TipoServico | null;
  MECANICA: TipoServico | null;
  CALDEIRARIA: TipoServico | null;
  OBS: string | null;
  OSEXTERNA: TipoServico | null;
  OPEXTERNO: string | null;
  totalServicos: number;
}

export interface ApontamentoFormData {
  codveiculo: number | null;
  km: number | null;
  horimetro: number | null;
  tag: string;
  obs: string;
  borrcharia: boolean;
  eletrica: boolean;
  funilaria: boolean;
  mecanica: boolean;
  caldeiraria: boolean;
  osExterna: boolean;
  opExterno: string;
  dtProgramacao: string;
}

export interface ServicoApontamento {
  CODIGO: number;
  SEQ: number;
  DESCRITIVO: string | null;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  GERAOS: string | null;
  NUOS: number | null;
  HR: number | null;
  KM: number | null;
  DTPROGRAMACAO: string | null;
}

export interface ServicoFormData {
  descritivo: string;
  codprod: number | null;
  qtd: number | null;
  geraOs: boolean;
  hr: number | null;
  km: number | null;
  dtProgramacao: string;
}

export interface ApontamentoListParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  statusOs?: string;
  codveiculo?: number;
  dtInicio?: string;
  dtFim?: string;
}

export interface ApontamentoListResponse {
  data: ApontamentoListItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
