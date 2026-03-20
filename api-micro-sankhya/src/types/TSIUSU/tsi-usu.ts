export interface TsiUsu {
  codusu: number;
  nomeusu: string;
  email: string | null;
  codparc: number | null;
  nomeparc?: string;
  codemp: number | null;
  nomeempresa?: string;
  codfunc: number | null;
  ativo: 'S' | 'N';
}

export interface TsiUsuListOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  ativo?: 'S' | 'N';
  codemp?: number;
}

export interface TsiUsuSearchResult {
  codusu: number;
  nomeusu: string;
  email: string | null;
  codparc: number | null;
  nomeparc?: string;
  codemp: number | null;
  nomeempresa?: string;
  codfunc: number | null;
  codgrupo: number | null;
  nomegrupo?: string;
  ativo: 'S' | 'N';
}
