// Colaborador na lista (sem treinamentos)
export interface ColaboradorListItem {
  CODFUNC: number;
  NOMEFUNC: string;
  CODEMP: number;
  CODPARC: number;
  RAZAOSOCIAL: string;
  DESCRCARGO: string;
}

export interface ColaboradorListResponse {
  data: ColaboradorListItem[];
  total: number;
  limit: number;
  page: number;
  offset?: number;
}

// Treinamento/Habilitação com detalhes
export interface TreinamentoListItem {
  CODFUNC: number;
  NOMEFUNC: string;
  CODEMP: number;
  RAZAOSOCIAL: string;
  DESCRCARGO: string;
  HABILITACAO: string;
  DTEMISSAO: string;
  DTVALIDADE: string;
  STATUS_VALIDADE: string;
}

export interface TreinamentoListResponse {
  codfunc: number;
  data: TreinamentoListItem[];
  total: number;
}

export interface ListarTreinamentosParams {
  page?: number;
  limit?: number;
  offset?: number;
  coddep?: number;
  situacao?: 'ATIVO' | 'INATIVO';
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

// Tipo expandido para exibição em tabela
export interface TreinamentoDataGridItem extends TreinamentoListItem {
  id?: string; // Para DataGrid
}

export interface OpcaoFiltro {
  codigo: number;
  descricao: string;
}

export interface FiltrosOpcoes {
  empresas: OpcaoFiltro[];
  departamentos: OpcaoFiltro[];
  cargos?: OpcaoFiltro[];
  funcoes?: OpcaoFiltro[];
}
