import type { NotaDetalheCab, NotaDetalheItem, NotaDetalheTop, NotaDetalheVar } from './nota-detalhe';

export interface CabRelacionado {
  NUNOTA: number;
  NUMNOTA: number | null;
  CODTIPOPER: number;
  TIPO_OPER_DESCRICAO: string | null;
  TIPMOV: string | null;
  DTNEG: string;
  CODPARC: number;
  PARCEIRO_NOME: string | null;
  CODCENCUS: number | null;
  CENTRO_CUSTO_DESCRICAO: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string;
  STATUS_DESCRICAO: string;
  CODUSUINC: number | null;
  NOME_USUARIO: string | null;
  AD_NUNOTAREQORIG?: number | null;
  OBSERVACAO: string | null;
}

export interface CabVarLink {
  NUNOTA: number;
  NUNOTA_ORIGEM: number | null;
  SEQUENCIA: number;
  NUMNOTA: number | null;
  CODTIPOPER: number | null;
  TIPO_OPER_DESCRICAO: string | null;
  DTNEG: string | null;
  VLRNOTA: number | null;
  STATUSNOTA: string | null;
  CODPARC: number | null;
  PARCEIRO_NOME: string | null;
}

export interface CabExistencia {
  existeNoCAB: number;
  refsNoVAR: number;
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
  ORIGEM: 'ATIVO' | 'EXCLUIDO';
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
  /** Whether the record exists in TGFCAB */
  existe: boolean;
  /** Whether there are references in TGFVAR */
  refsNoVAR: number;

  /** Main record (null if deleted) */
  cabecalho: NotaDetalheCab | null;
  /** Items (empty if deleted) */
  itens: NotaDetalheItem[];
  /** TOP config (null if deleted or missing) */
  top: NotaDetalheTop | null;
  /** TGFVAR entries for this NUNOTA */
  variacoes: NotaDetalheVar[];

  /** Documents linked via AD_NUNOTAREQORIG */
  linkedByReq: CabRelacionado[];
  /** Documents linked via TGFVAR chain */
  linkedByVar: CabVarLink[];
  /** Documents with same parceiro + products */
  relacionadosPorProduto: CabRelacionado[];

  /** Full audit trail from AD_GIG_LOG */
  auditLog: CabAuditLogEntry[];

  /** Deleted record from TGFCAB_EXC (null if not in lixeira) */
  lixeira: CabLixeiraCab | null;
  /** Deleted items from TGFITE_EXC */
  lixeiraItens: CabLixeiraItem[];
  /** Cotacao info (null if no NUMCOTACAO) */
  cotacao: CabCotacao | null;
  /** Documents linked to same cotacao */
  cotacaoDocumentos: CabCotacaoDocumento[];
  /** TGFLIB liberations */
  liberacoes: CabLiberacao[];
  /** TSILIB system liberations */
  liberacoesSistema: CabLiberacaoSistema[];

  /** Queries that failed (returned empty due to error) */
  _warnings?: string[];
}
