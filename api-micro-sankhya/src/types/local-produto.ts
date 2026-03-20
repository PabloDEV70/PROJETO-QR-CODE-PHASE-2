export interface LocalItem {
  codLocal: number;
  descrLocal: string;
  codLocalPai: number | null;
  grau: number;
  ativo: string;
  analitico: string;
  totalProdutosEstoque: number;
  codUsuario?: number | null;
  codparcUsuario?: number | null;
  nomeUsuario?: string | null;
}

export interface EstoqueLocal {
  codProd: number;
  descrProd: string;
  controle: string;
  estoque: number;
  reservado: number;
  estMin: number;
  estMax: number;
  codGrupoProd?: number;
  descrGrupoProd?: string;
  prodAtivo?: string;
  complDesc?: string;
  localizacao?: string;
  usoProd?: string;
}

export interface ProdutoDetalhes {
  codProd: number;
  descrProd: string;
  codGrupoProd?: number;
  descrGrupoProd?: string;
  ativo: string;
  complDesc?: string;
  codVol?: string;
  marca?: string;
  referencia?: string;
  localizacao?: string;
  pesoBruto?: number;
  pesoLiq?: number;
  codLocalPadrao?: number;
  temImagem: boolean;
  usoProd?: string;
  ncm?: string;
  anexos: unknown[];
}

export interface ArvoreLocal {
  codLocal: number;
  descrLocal: string;
  codLocalPai: number | null;
  grau: number;
  analitico: string;
  totalProdutosEstoque: number;
  codUsuario?: number | null;
  codparcUsuario?: number | null;
  nomeUsuario?: string | null;
  children: ArvoreLocal[];
  produtos?: EstoqueLocal[];
}
