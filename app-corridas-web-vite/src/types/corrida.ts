export interface Corrida {
  ID: number;
  USU_SOLICITANTE: number;
  NOMESOLICITANTE: string;
  USU_MOTORISTA: number | null;
  NOMEMOTORISTA: string | null;
  CODPARC_MOTORISTA: number | null;
  CODPARC: number | null;
  NOMEPARC: string | null;
  CODPARC_SOLICITANTE: number | null;
  DESTINO: string | null;
  BUSCARLEVAR: string;
  PASSAGEIROSMERCADORIA: string | null;
  OBS: string | null;
  STATUS: string;
  PRIORIDADE: string | null;
  DT_ACIONAMENTO: string | null;
  DT_CREATED: string;
  DT_UPDATED: string | null;
  DT_FINISHED: string | null;
  USER_ID: number | null;
  ENVIAWPP: string | null;
  SETOR: string | null;
  TELEFONE_PARCEIRO: string | null;
  EMAIL_PARCEIRO: string | null;
  CEP_PARCEIRO: string | null;
  NUMEND_PARCEIRO: string | null;
  COMPLEMENTO_PARCEIRO: string | null;
  RUA_PARCEIRO: string | null;
  BAIRRO_PARCEIRO: string | null;
  CIDADE_PARCEIRO: string | null;
  UF_PARCEIRO: string | null;
  LATITUDE_PARCEIRO: number | null;
  LONGITUDE_PARCEIRO: number | null;
  CARGO_MOTORISTA: string | null;
  NOMECOMPLETO_MOTORISTA: string | null;
  CARGO_SOLICITANTE: string | null;
  NOMECOMPLETO_SOLICITANTE: string | null;
}

export interface CorridaResumo {
  abertas: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  total: number;
}

export interface Motorista {
  CODUSU: number;
  NOMEUSU: string;
}

export interface ListCorridasParams {
  page?: number;
  limit?: number;
  status?: string;
  motorista?: number;
  solicitante?: number;
  codparc?: number;
  buscarLevar?: string;
  dataInicio?: string;
  dataFim?: string;
  search?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface TempoTransitoStats {
  avgMinutos: number;
  minMinutos: number;
  maxMinutos: number;
  totalConcluidas: number;
}

export interface RankingItem {
  codigo: number;
  nome: string;
  corridas: number;
}

export interface VolumeMensal {
  ano: number;
  mes: number;
  corridas: number;
}

export interface DistribuicaoTipo {
  tipo: string;
  label: string;
  corridas: number;
}

export interface DistribuicaoHoraria {
  hora: number;
  corridas: number;
}

export type StatusCorrida = '0' | '1' | '2' | '3';

export const STATUS_LABELS: Record<string, string> = {
  '0': 'Aberto',
  '1': 'Em Andamento',
  '2': 'Concluido',
  '3': 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  '0': '#ed6c02',
  '1': '#1976d2',
  '2': '#2e7d32',
  '3': '#d32f2f',
};

export const BUSCAR_LEVAR_LABELS: Record<string, string> = {
  '0': 'Buscar',
  '1': 'Levar',
  '3': 'Levar e Buscar',
};

export const PRIORIDADE_LABELS: Record<string, string> = {
  '0': 'Alta',
  '1': 'Media',
  '2': 'Baixa',
};

export interface CreateCorridaPayload {
  USU_SOLICITANTE: number;
  USU_MOTORISTA?: number;
  CODPARC?: number;
  DESTINO?: string;
  BUSCARLEVAR: string;
  PASSAGEIROSMERCADORIA?: string;
  OBS?: string;
  PRIORIDADE?: string;
  DT_ACIONAMENTO?: string;
  ENVIAWPP?: string;
}

export interface UpdateCorridaPayload {
  USU_MOTORISTA?: number;
  CODPARC?: number;
  DESTINO?: string;
  BUSCARLEVAR?: string;
  PASSAGEIROSMERCADORIA?: string;
  OBS?: string;
  PRIORIDADE?: string;
  DT_ACIONAMENTO?: string;
  ENVIAWPP?: string;
}

export interface MutationResult {
  sucesso: boolean;
  mensagem: string;
  registrosAfetados?: number;
}
