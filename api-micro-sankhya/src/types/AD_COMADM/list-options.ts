export interface ListChamadosOptions {
  page: number;
  limit: number;
  status?: string;
  prioridade?: string;
  tipoChamado?: string;
  codparc?: number;
  solicitante?: number;
  solicitado?: number;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  search?: string;
  setor?: string;
  statusExclude?: string;
  codgrupo?: number;
  scopeUser?: number;
}

export interface ListChamadosResult {
  data: import('./ad-comadm').AdComadm[];
  total: number;
}

export interface UsuarioChamado {
  CODUSU: number;
  NOMEUSU: string;
  CODPARC: number | null;
  CODGRUPO: number | null;
}
