export interface CabDetalheCab {
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

export interface CabDetalheItem {
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

export interface CabRelacionado {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  TIPMOV: string | null;
  DTNEG: string;
  CODPARC: number;
  PARCEIRO_NOME: string | null;
  CODCENCUS?: number | null;
  CENTRO_CUSTO_DESCRICAO?: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string;
  STATUS_DESCRICAO: string;
  CODUSUINC?: number | null;
  NOME_USUARIO: string | null;
  AD_NUNOTAREQORIG?: number | null;
  OBSERVACAO?: string | null;
}

export interface CabVarLink {
  NUNOTA: number;
  NUNOTA_ORIGEM: number | null;
  SEQUENCIA: number;
  DTMOV: string | null;
  HRMOV: string | null;
  DATA_HORA: string | null;
  EVENTO: string | null;
  CODUSU: number | null;
  NOME_USUARIO: string | null;
  NUMNOTA: number | null;
  CODTIPOPER: number | null;
  TIPO_OPER_DESCRICAO: string | null;
  DTNEG: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string | null;
  CODPARC: number | null;
  PARCEIRO_NOME: string | null;
}

export interface CabDetalheTop {
  CODTIPOPER: number;
  DESCROPER: string;
  TIPMOV: string | null;
  TIPMOV_DESCRICAO: string;
  ATUALEST: string | null;
  ATUALEST_DESCRICAO: string;
  ATUALFIN: string | null;
  ATUALFIN_DESCRICAO: string;
  ATIVO: string | null;
  TIPFRETE: string | null;
  TIPFRETE_DESCRICAO: string;
  EMITENTE: string | null;
  EMITENTE_DESCRICAO: string;
  HABILITANFE: string | null;
}

export interface CabDetalheVar {
  NUNOTA: number;
  SEQUENCIA: number;
  NUNOTA_ORIGEM: number | null;
  SEQUENCIA_ORIGEM: number | null;
  DTMOV: string;
  HRMOV: string;
  DATA_HORA: string;
  EVENTO: string | null;
  NOME_USUARIO: string | null;
  CODPARC_USUARIO: number | null;
}

export interface CabAuditLogEntry {
  ID: number;
  ACAO: string;
  TABELA: string;
  CODUSU: number | null;
  NOMEUSU: string | null;
  CAMPOS_ALTERADOS: string | null;
  VERSAO_NOVA: string | null;
  VERSAO_ANTIGA: string | null;
  DTCREATED: string;
}

export interface CabLixeiraCab {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODEMP: number;
  CODPARC: number;
  PARCEIRO_NOME: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string;
  STATUS_DESCRICAO: string;
  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  TIPMOV: string | null;
  TIPMOV_DESCRICAO: string;
  DTNEG: string;
  NUMCOTACAO: number | null;
  APROVADO: string | null;
  PENDENTE: string | null;
  CODCENCUS: number | null;
  CENTRO_CUSTO_DESCRICAO: string | null;
  CODVEND: number | null;
  VENDEDOR_NOME: string | null;
  CODUSUINC: number | null;
  NOME_USUARIO_INC: string | null;
  OBSERVACAO: string | null;
  NT_USERNAME: string | null;
  HOSTNAME: string | null;
  DHEXCLUSAO: string;
}

export interface CabLixeiraItem {
  NUNOTA: number;
  SEQUENCIA: number;
  CODPROD: number;
  PRODUTO_DESCRICAO: string;
  PRODUTO_REFERENCIA: string | null;
  QTDNEG: number;
  VLRUNIT: number | null;
  VLRTOT: number | null;
  UNIDADE: string | null;
  VLRDESC: number | null;
  PERCDESC: number | null;
  VLRIPI: number | null;
  VLRICMS: number | null;
  OBSERVACAO_ITEM: string | null;
  EXCLUIDO_POR: string | null;
  EXCLUIDO_DE: string | null;
  DHEXCLUSAO: string;
}

export interface CabCotacao {
  NUMCOTACAO: number;
  SITUACAO: string;
  SITUACAO_DESCRICAO: string;
  DHINIC: string | null;
  DHFINAL: string | null;
  NUNOTAORIG: number | null;
  GERPEDREAL: string | null;
  OBSERVACAO: string | null;
  CODEMP: number;
  CODCENCUS: number | null;
  CENTRO_CUSTO_DESCRICAO: string | null;
  CODUSURESP: number | null;
  NOME_RESPONSAVEL: string | null;
  CODUSUREQ: number | null;
  NOME_SOLICITANTE: string | null;
}

export interface CabCotacaoDocumento {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODPARC: number;
  PARCEIRO_NOME: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string;
  STATUS_DESCRICAO: string;
  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  TIPMOV: string | null;
  DTNEG: string;
  ORIGEM: string;
}

export interface CabLiberacao {
  NUNOTA: number;
  CODUSU: number;
  NOME_USUARIO: string | null;
  DT: string;
  LIBERACOES: string | null;
  OBS: string | null;
  VLRTOTAL: number | null;
}

export interface CabLiberacaoSistema {
  NUCHAVE: number;
  TABELA: string;
  EVENTO: number;
  SEQUENCIA: number;
  CODUSUSOLICIT: number;
  NOME_SOLICITANTE: string | null;
  DHSOLICIT: string;
  CODUSULIB: number;
  NOME_LIBERADOR: string | null;
  DHLIB: string | null;
  VLRLIMITE: number;
  VLRATUAL: number;
  VLRLIBERADO: number;
  VLRTOTAL: number | null;
  OBSERVACAO: string | null;
  OBSLIB: string | null;
  REPROVADO: string;
  SEQCASCATA: number;
}

export interface CabDetalhamentoCompleto {
  existe: boolean;
  refsNoVAR: number;
  cabecalho: CabDetalheCab | null;
  itens: CabDetalheItem[];
  top: CabDetalheTop | null;
  variacoes: CabDetalheVar[];
  linkedByReq: CabRelacionado[];
  linkedByVar: CabVarLink[];
  relacionadosPorProduto: CabRelacionado[];
  auditLog: CabAuditLogEntry[];
  lixeira: CabLixeiraCab | null;
  lixeiraItens: CabLixeiraItem[];
  cotacao: CabCotacao | null;
  cotacaoDocumentos: CabCotacaoDocumento[];
  liberacoes: CabLiberacao[];
  liberacoesSistema: CabLiberacaoSistema[];
  _warnings?: string[];
}
