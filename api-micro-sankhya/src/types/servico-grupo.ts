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

export interface GrupoComServicos extends ServicoGrupo {
  servicos: ServicoItem[];
}

export interface ArvoreGrupo {
  codGrupoProd: number;
  descrGrupoProd: string;
  codGrupoPai: number | null;
  grau: number;
  ativo?: string;
  children: ArvoreGrupo[];
  servicos?: ServicoItem[];
}
