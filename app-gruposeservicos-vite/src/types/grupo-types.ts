export interface ServicoGrupo {
  codGrupoProd: number;
  descrGrupoProd: string;
  codGrupoPai: number | null;
  grau: number;
  analitico: string;
  ativo?: string;
}

export interface ServicoItem {
  codProd: number;
  descrProd: string;
  codGrupoProd: number;
  utilizacoes: number;
  ativo?: string;
}

export interface ArvoreGrupo {
  codGrupoProd: number;
  descrGrupoProd: string;
  codGrupoPai: number | null;
  grau: number;
  analitico?: string;
  ativo?: string;
  children: ArvoreGrupo[];
  servicos?: ServicoItem[];
}

export interface CreateGrupoInput {
  CODGRUPOPROD: number;
  DESCRGRUPOPROD: string;
  CODGRUPAI?: number | null;
}

export interface UpdateGrupoInput {
  DESCRGRUPOPROD: string;
}

export interface CreateServicoInput {
  DESCRPROD: string;
  CODGRUPOPROD: number;
}

export interface UpdateServicoInput {
  DESCRPROD: string;
}

export interface MoveServicoInput {
  CODGRUPOPROD: number;
}

export interface ToggleAtivoInput {
  ativo: 'S' | 'N';
}
