export interface NotaDetalheCab {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODEMP: number;
  NOME_EMPRESA: string | null;
  CODPARC: number;
  PARCEIRO_NOME: string | null;
  PARCEIRO_TIPO_PESSOA: string | null;
  PARCEIRO_CGC_CPF: string | null;
  PARCEIRO_CODCID: number | null;
  PARCEIRO_CIDADE: string | null;
  PARCEIRO_UF: string | null;

  DTNEG: string;
  DTMOV: string;
  HRMOV: string;
  DATA_HORA_MOVIMENTO: string;
  DTENTSAI: string | null;
  DTFATUR: string | null;

  STATUSNOTA: string;
  STATUS_DESCRICAO: string;
  STATUSNFE: string | null;
  STATUS_NFE_DESCRICAO: string;

  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  ATUALEST: string | null;
  ATUALEST_DESCRICAO: string;
  ATUALFIN: string | null;
  ATUALFIN_DESCRICAO: string;
  TIPMOV: string | null;
  TIPMOV_DESCRICAO: string;

  VLRNOTA: number | null;
  VLRDESC: number | null;
  VLRFRETE: number | null;
  VLRIPI: number | null;
  VLRICMS: number | null;
  VLRSUBST: number | null;
  BASEICMS: number | null;
  VLRDESPTOT: number | null;

  CODUSUINC: number;
  NOME_USUARIO_INC: string | null;
  CODPARC_USUARIO_INC: number | null;
  CODUSUALTER: number | null;
  NOME_USUARIO_ALTER: string | null;
  DTALTER: string | null;

  OBSERVACAO: string | null;
  CODNAT: number | null;
  NATUREZA_DESCRICAO: string | null;
  CODCENCUS: number | null;
  CENTRO_CUSTO_DESCRICAO: string | null;
  CODPROJ: number | null;
  CODTIPVENDA: number | null;
  CODVEND: number | null;
  VENDEDOR_NOME: string | null;
  NUFIN: number | null;
  CHAVENFE: string | null;
  SERIENOTA: string | null;
  NUMCOTACAO: number | null;
}

export interface NotaDetalheItem {
  NUNOTA: number;
  SEQUENCIA: number;
  CODPROD: number;
  PRODUTO_DESCRICAO: string;
  PRODUTO_REFERENCIA: string | null;
  CODGRUPOPROD: number | null;
  GRUPO_PRODUTO: string | null;
  PRODUTO_MARCA: string | null;
  USOPROD: string | null;
  USOPROD_DESCRICAO: string;
  CODLOCALORIG: number | null;
  CODLOCALDESTINO: number | null;
  CONTROLE: string | null;

  QTDNEG: number;
  QTDENTREGUE: number | null;
  QTD_PENDENTE: number;

  VLRUNIT: number | null;
  VLRTOT: number | null;
  VLRDESC: number | null;
  PERCDESC: number | null;
  VLRICMS: number | null;
  VLRIPI: number | null;
  BASEICMS: number | null;
  ALIQICMS: number | null;
  ALIQIPI: number | null;
  CODCFO: number | null;
  CODTRIB: string | null;
  OBSERVACAO_ITEM: string | null;

  UNIDADE: string | null;
}

export interface NotaDetalheTop {
  CODTIPOPER: number;
  DESCROPER: string;
  DHALTER: string;
  TIPMOV: string | null;
  TIPMOV_DESCRICAO: string;
  ATUALEST: string | null;
  ATUALEST_DESCRICAO: string;
  ATUALFIN: string | null;
  ATUALFIN_DESCRICAO: string;
  ATIVO: string | null;
  GOLNEG: string | null;
  BONIFICACAO: string | null;
  LANCDEDUTIVEL: string | null;
  GERADUPLICATA: string | null;
  CONTROLEEST: string | null;
  TIPFRETE: string | null;
  TIPFRETE_DESCRICAO: string;
  EMITENTE: string | null;
  EMITENTE_DESCRICAO: string;
  HABILITANFE: string | null;
  MODELO: string | null;
  AD_LAYOUTCAB: string | null;
  AD_LAYOUTITE: string | null;
  AD_LAYOUTFIN: string | null;
}

export interface NotaDetalheVar {
  NUNOTA: number;
  SEQUENCIA: number;
  NUNOTA_ORIGEM: number | null;
  SEQUENCIA_ORIGEM: number | null;
}

export interface NotaDetalheCompleta {
  cabecalho: NotaDetalheCab;
  itens: NotaDetalheItem[];
  top: NotaDetalheTop | null;
  variacoes: NotaDetalheVar[];
}
