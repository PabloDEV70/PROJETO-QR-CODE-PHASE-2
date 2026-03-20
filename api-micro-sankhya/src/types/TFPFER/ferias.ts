export interface Ferias {
  codemp: number;
  codfunc: number;
  codparc: number | null;
  nomeFuncionario: string;
  nomeEmpresa: string;
  dtSaida: string;
  numDiasFer: number;
  dtRetorno: string;
  abonoPec: number;
  aprovado: string;
  dtPrevista: string | null;
  departamento: string | null;
  cargo: string | null;
}

export interface FeriasResumo {
  emFeriasAgora: number;
  programadasProximos30Dias: number;
  pendentesAprovacao: number;
}

export interface FeriasRow {
  codemp: number;
  codfunc: number;
  codparc: number | null;
  nomeFuncionario: string;
  nomeEmpresa: string;
  dtSaida: string;
  numDiasFer: number;
  dtRetorno: string;
  abonoPec: number;
  aprovado: string;
  dtPrevista: string | null;
  departamento: string | null;
  cargo: string | null;
}

export interface FeriasResumoRow {
  emFeriasAgora: number;
  programadas: number;
}

export interface SolicitacaoFeriasRow {
  pendentes: number;
}
