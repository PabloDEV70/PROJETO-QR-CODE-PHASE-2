export interface ServicoGrupo {
  codGrupoProd: number;
  descrGrupoProd: string;
  codGrupoPai: number | null;
  grau: number;
  analitico: string;
}

export interface ServicoItem {
  codProd: number;
  descrProd: string;
  codGrupoProd: number;
  utilizacoes: number;
}

export interface ArvoreGrupo {
  codGrupoProd: number;
  descrGrupoProd: string;
  codGrupoPai: number | null;
  grau: number;
  children: ArvoreGrupo[];
  servicos?: ServicoItem[];
}
