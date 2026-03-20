/** Matches AD_GIG_LOG table columns */
export interface RegistroAuditoria {
  ID: number;
  ACAO: string;
  TABELA: string;
  CODUSU: number;
  NOMEUSU: string;
  DTCREATED: string;
}

export interface EstatisticasAuditoria {
  totalRegistros: number;
  porOperacao: Record<string, number>;
}

export interface ListaAuditoria {
  data: RegistroAuditoria[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditoriaFilters {
  tabela?: string;
  usuario?: string;
  operacao?: string;
  page?: number;
  limit?: number;
}
