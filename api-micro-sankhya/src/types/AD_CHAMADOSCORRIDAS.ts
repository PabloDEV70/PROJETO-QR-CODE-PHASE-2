export interface Corrida {
  ID: number;
  USU_MOTORISTA: number | null;
  CODPARC: number | null;
  DESTINO: string | null;
  STATUS: '0' | '1' | '2' | '3';
  USU_SOLICITANTE: number | null;
  DT_UPDATED: string | null;
  DT_FINISHED: string | null;
  USER_ID: number | null;
  DT_CREATED: string | null;
  PRIORIDADE: '0' | '1' | '2' | null;
  BUSCARLEVAR: '0' | '1' | '3' | null;
  OBS: string | null;
  PASSAGEIROSMERCADORIA: string | null;
  DT_ACIONAMENTO: string | null;
  ENVIAWPP: 'S' | 'N' | null;
  NOMEMOTORISTA: string | null;
  NOMEPARC: string | null;
  NOMESOLICITANTE: string | null;
  SETOR: string | null;
}

export interface CorridaResumo {
  STATUS: string;
  TOTAL: number;
}

export interface CorridaStats {
  AVG_MINUTOS: number | null;
  MIN_MINUTOS: number | null;
  MAX_MINUTOS: number | null;
}

export interface ListCorridasOptions {
  page: number;
  limit: number;
  status?: string;
  prioridade?: string;
  buscarLevar?: string;
  codparc?: number;
  motorista?: number;
  solicitante?: number;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  search?: string;
}

export interface ListCorridasResult {
  data: Corrida[];
  total: number;
}
