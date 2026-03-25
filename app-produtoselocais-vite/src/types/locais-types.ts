export interface LocalItem {
  CODLOCAL: number;
  DESCRLOCAL: string;
  CODLOCALPAI: number | null;
  GRAU: number;
  ATIVO: string;
  ANALITICO: string;
  totalProdutosEstoque: number;
  CODUSU?: number | null;
  USU_CODPARC?: number | null;
  NOMEUSU?: string | null;
}

export interface ArvoreLocal extends LocalItem {
  children: ArvoreLocal[];
}

export interface EstoqueItem {
  CODPROD: number;
  DESCRPROD: string;
  CONTROLE: string;
  ESTOQUE: number;
  RESERVADO: number;
  ESTMIN: number;
  ESTMAX: number;
  CODGRUPOPROD?: number;
  DESCRGRUPOPROD?: string;
  PRODATIVO?: string;
  COMPLDESC?: string;
  LOCALIZACAO?: string;
  USOPROD?: string;
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
  CODVEICULO: number;
  PLACA: string;
  MARCAMODELO: string;
  AD_TAG?: string;
  AD_TIPOEQPTO?: string;
  ATIVO: string;
}
