import { RequisicaoRh } from './requisicao-rh';

export interface ListarRequisicoesParams {
  page?: number;
  limit?: number;
  origemTipo?: string;
  status?: number;
  codemp?: number;
  codfunc?: number;
  coddep?: number;
  codcargo?: number;
  codfuncao?: number;
  dataInicio?: string;
  dataFim?: string;
  termo?: string;
  orderBy?: 'dtCriacao' | 'status' | 'origemTipo' | 'nomeFuncionario';
  orderDir?: 'ASC' | 'DESC';
}

export interface ListarRequisicoesResult {
  data: RequisicaoRh[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RequisicaoRow {
  id: number;
  dtCriacao: string;
  status: number;
  statusLabel: string;
  origemTipo: string;
  origemTipoLabel: string;
  codemp: number;
  codfunc: number;
  codparc: number | null;
  observacao: string | null;
  prioridade: number | null;
  dtLimite: string | null;
  origemId: number | null;
  codusu: number;
  nomeFuncionario: string;
  nomeEmpresa: string;
  descricaoCargo: string;
  departamento: string | null;
  funcao: string | null;
  nomeSolicitante: string;
  diasRestantes: number | null;
}

export interface CountRow {
  total: number;
}
