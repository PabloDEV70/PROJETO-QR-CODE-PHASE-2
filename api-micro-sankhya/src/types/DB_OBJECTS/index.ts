export interface DbView {
  schema: string;
  nome: string;
  definicao: string | null;
}

export interface ColunaView {
  nome: string;
  tipo: string;
  nulo: boolean;
  posicao: number;
  tamanhoMaximo: number | null;
  precisao: number | null;
  escala: number | null;
}

export interface DbViewDetalhe extends DbView {
  colunas: ColunaView[];
}

export interface DbProcedure {
  schema: string;
  nome: string;
  tipoDescricao: string;
  dataCriacao: string;
  dataModificacao: string;
  definicao: string | null;
}

export interface ParametroProcedure {
  nome: string;
  tipo: string;
  tamanhoMaximo: number | null;
  precisao: number | null;
  escala: number | null;
  saida: boolean;
}

export interface DbProcedureDetalhe extends DbProcedure {
  parametros: ParametroProcedure[];
}

export interface DbTrigger {
  schema: string;
  nome: string;
  tabela: string;
  tipoDescricao: string;
  desabilitado: boolean;
  definicao: string | null;
}

export interface DbTriggerDetalhe extends DbTrigger {
  eventos: string[];
}

export interface DbRelacionamento {
  nomeConstraint: string;
  schemaPai: string;
  tabelaPai: string;
  colunaPai: string;
  schemaReferenciado: string;
  tabelaReferenciada: string;
  colunaReferenciada: string;
}

export interface ResumoBanco {
  totalTabelas: number;
  totalViews: number;
  totalTriggers: number;
  totalProcedures: number;
  tamanhoTotalMb: number;
  tamanhoDadosMb: number;
  tamanhoIndiceMb: number;
}

export interface DbListOptions {
  schema?: string;
  limite?: number;
  offset?: number;
  truncar?: boolean;
  incluirDefinicao?: boolean;
}

export interface EstatisticasCache {
  totalEntradas: number;
  tamanhoEstimadoKb: number;
  taxaAcerto: number;
}
