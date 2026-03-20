// RDO Motivo definition
export interface Motivo {
  RDOMOTIVOCOD: number;
  DESCRICAO: string;
  SIGLA?: string;
  ATIVO: 'S' | 'N';
  DTINC?: string;
  DTALT?: string;
  PRODUTIVO?: 'S' | 'N' | null;
  TOLERANCIA?: number | null;
  PENALIDADE?: number | null;
  rdoCount?: number;
}

// Config item from /motivos/config
export interface MotivoConfigItem {
  rdomotivocod: number;
  produtivo: boolean;
  toleranciaMin: number;
  penalidadeMin: number;
  wtCategoria: string;
}

// Motivo search/list params
export interface MotivosParams {
  page?: number;
  limit?: number;
  ativo?: 'S' | 'N';
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
