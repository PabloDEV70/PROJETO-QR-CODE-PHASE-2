// ── DB Objects ─────────────────────────────────────────
export interface DbView {
  schema: string;
  nome: string;
  colunas: number;
  dataCriacao: string;
}

export interface DbViewDetalhe {
  schema: string;
  nome: string;
  definicao: string;
  colunas: { nome: string; tipo: string; tamanho: number; nullable: boolean }[];
  dataCriacao: string;
  dataModificacao: string;
}

export interface DbProcedure {
  schema: string;
  nome: string;
  tipo: string;
  dataCriacao: string;
  dataModificacao: string;
}

export interface DbProcedureDetalhe {
  schema: string;
  nome: string;
  tipo: string;
  definicao: string;
  parametros: { nome: string; tipo: string; tamanho: number; direcao: string; valorPadrao: string | null }[];
  dataCriacao: string;
  dataModificacao: string;
}

export interface DbTrigger {
  schema: string;
  nome: string;
  tabelaAlvo: string;
  tipo: string;
  evento: string;
  ativo: boolean;
}

export interface DbTriggerDetalhe {
  schema: string;
  nome: string;
  tabelaAlvo: string;
  tipo: string;
  evento: string;
  ativo: boolean;
  definicao: string;
  dataCriacao: string;
  dataModificacao: string;
}

export interface DbFunction {
  schema: string;
  nome: string;
  tipoDescricao: string;
  dataCriacao: string;
  dataModificacao: string;
}

export interface DbFunctionDetalhe extends DbFunction {
  definicao: string | null;
  parametros: { nome: string; tipo: string; tamanhoMaximo: number | null; saida: boolean }[];
}

export interface DbRelacionamento {
  constraintName: string;
  schemaOrigem: string;
  tabelaOrigem: string;
  colunaOrigem: string;
  schemaDestino: string;
  tabelaDestino: string;
  colunaDestino: string;
}

export interface DbListOptions {
  schema?: string;
  termo?: string;
  limite?: number;
  offset?: number;
}

export interface EstatisticasCache {
  totalEntradas: number;
  ultimaAtualizacao: string;
  hitRate: number;
}

// ── Dictionary ─────────────────────────────────────────
export interface TabelaDicionario {
  nomeTabela: string;
  descricao: string;
  tipoNumeracao?: string;
  adicional?: string;
}

export interface CampoDicionario {
  nucampo: number;
  nomeCampo: string;
  descricao: string;
  tipo: string;
  tamanho: number | null;
  tipoapresentacao: string | null;
  mascara: string | null;
  permitePesquisa: boolean;
  calculado: boolean;
  ordem: number;
  sistema: boolean;
  adicional: boolean;
  expressao?: string | null;
  permitepadrao?: boolean;
  visivelgridpesquisa?: boolean;
  controle?: string | null;
  domain?: string | null;
  qtdOpcoes: number;
  isPk: boolean;
  fkTable: string | null;
}

export interface TableTrigger {
  nome: string;
  tipo: string;
  eventos: string;
  ativo: boolean;
  definicao: string;
  dataCriacao: string;
  dataModificacao: string;
}

export interface FieldOption {
  valor: string;
  opcao: string;
  padrao: boolean;
}

export interface TableInstance {
  nuinstancia: number;
  nomeInstancia: string;
  descricao: string;
  ativo: boolean;
}

export type FieldTypesMap = Record<string, string>;

export interface DictFieldSearchResult {
  nucampo: number;
  nomeTabela: string;
  nomeCampo: string;
  descricao: string;
  tipo: string;
  tipoapresentacao: string;
  descricaoTabela: string;
}

// ── Audit (AD_GIG_LOG) ────────────────────────────────
export interface RegistroAuditoria {
  ID: number;
  ACAO: string;
  TABELA: string;
  CODUSU: number;
  NOMEUSU: string;
  DTCREATED: string;
}

export interface EstatisticasAuditoria {
  totalRegistros: number;
  porOperacao: Record<string, number>;
}

export interface ListaAuditoria {
  data: RegistroAuditoria[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditoriaFilters {
  tabela?: string;
  usuario?: string;
  operacao?: string;
  page?: number;
  limit?: number;
}
