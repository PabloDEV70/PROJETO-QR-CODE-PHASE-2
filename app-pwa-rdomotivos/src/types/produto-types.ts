/** Lightweight search result — no estoque data */
export interface ProdutoBusca {
  CODPROD: number;
  nome: string;
  complemento: string;
  marca: string;
  referencia: string;
  CODGRUPOPROD: number;
  grupo: string;
  unidade: string;
  USOPROD: string;
  temImagem: number;
}

/** Full product detail by ID — includes estoque summary */
export interface ProdutoFull extends ProdutoBusca {
  ATIVO: string;
  localizacao: string;
  pesoBruto: number;
  pesoLiq: number;
  ncm: string;
  estoqueTotal: number;
  reservadoTotal: number;
  locaisComEstoque: number;
}

export interface ProdutoEstoque {
  CODEMP: number;
  CODLOCAL: number;
  nomeLocal: string;
  estoque: number;
  reservado: number;
  estMin: number;
  estMax: number;
  lote: string;
  DTENTRADA: string;
}

export interface ProdutoPlaca {
  placa: string;
  modelo: string;
  qtdOS: number;
  ultimaOS: string;
}

export interface GrupoProduto {
  CODGRUPOPROD: number;
  nome: string;
  qtd: number;
}
