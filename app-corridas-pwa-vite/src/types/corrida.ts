export interface Corrida {
  ID: number;
  USU_SOLICITANTE: number;
  NOMESOLICITANTE: string;
  USU_MOTORISTA: number | null;
  NOMEMOTORISTA: string | null;
  CODPARC: number | null;
  NOMEPARC: string | null;
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
  ENDERECO?: string | null;
  TELEFONE?: string | null;
  EMAIL?: string | null;
  BAIRRO?: string | null;
  CIDADE?: string | null;
  UF?: string | null;
  CEP?: string | null;
  CODPARC_SOL?: number | null;
  CODPARC_MOT?: number | null;
  CARGO_SOL?: string | null;
  CARGO_MOT?: string | null;
  SETOR_MOT?: string | null;
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

export interface UserRole {
  codusu: number;
  nome: string;
  codparc: number | null;
  cargo: string | null;
  departamento: string | null;
  isMotorista: boolean;
}

export interface Localizacao {
  lat: number | null;
  lng: number | null;
  accuracy?: number;
  ts?: string;
  tempoDesde?: number;
}

export interface MinhasCorridasParams {
  role?: 'motorista' | 'solicitante';
  status?: string;
  limit?: number;
}

export interface LocUser {
  codusu: number;
  nome: string;
  codparc: number | null;
  cargo: string | null;
  lat: number;
  lng: number;
  accuracy?: number;
  ts: string;
  tempoDesde: number;
}

export interface ParceiroBusca {
  CODPARC: number;
  NOMEPARC: string;
  ENDERECO?: string | null;
  TELEFONE?: string | null;
}
