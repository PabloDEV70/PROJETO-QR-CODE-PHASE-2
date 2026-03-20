export interface AdRdoMotivos {
  RDOMOTIVOCOD: number;
  DESCRICAO: string;
  SIGLA?: string; // Nullable based on query or assumption
  ATIVO: 'S' | 'N';
  DTINC: string; // ISO Date
  DTALT: string; // ISO Date
  PRODUTIVO?: 'S' | 'N' | null;
  TOLERANCIA?: number | null;
  PENALIDADE?: number | null;
  WTCATEGORIA?: string | null;
  // Computed fields
  rdoCount?: number;
}
