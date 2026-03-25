export interface LocalItem {
  codLocal: number;
  descrLocal: string;
  codLocalPai: number | null;
  grau: number;
  ativo?: string;
  analitico: string;
  totalProdutosEstoque: number;
  codUsuario?: number | null;
  codparcUsuario?: number | null;
  nomeUsuario?: string | null;
}

export interface ArvoreLocal extends LocalItem {
  children: ArvoreLocal[];
}

export interface EstoqueItem {
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

export interface ProdutoBusca {
  CODPROD: number;
  DESCRPROD: string;
  COMPLDESC?: string;
  MARCA?: string;
  REFERENCIA?: string;
  CODGRUPOPROD?: number;
  GRUPO?: string;
  UNIDADE?: string;
  USOPROD?: string;
  temImagem?: boolean;
}

export interface ProdutoDetalhes {
  CODPROD: number;
  DESCRPROD: string;
  CODGRUPOPROD?: number;
  DESCRGRUPOPROD?: string;
  ATIVO: string;
  COMPLDESC?: string;
  CODVOL?: string;
  MARCA?: string;
  REFERENCIA?: string;
  LOCALIZACAO?: string;
  PESOBRUTO?: number;
  PESOLIQ?: number;
  CODLOCALPADRAO?: number;
  TEMIMAGEM?: boolean;
  USOPROD?: string;
  NCM?: string;
  anexos?: unknown[];
  estoqueTotal?: number;
  estoqueReservado?: number;
  qtdLocais?: number;
}

export interface ProdutoEstoque {
  CODEMP: number;
  CODLOCAL: number;
  NOMELOCAL: string;
  ESTOQUE: number;
  RESERVADO: number;
  ESTMIN: number;
  ESTMAX: number;
  LOTE?: string;
  DTENTRADA?: string;
}

export interface GrupoProduto {
  CODGRUPOPROD: number;
  NOME: string;
  QTD: number;
}

export interface VeiculoProduto {
  PLACA: string;
  MODELO?: string;
  qtdOS?: number;
  ultimaOS?: string;
}
