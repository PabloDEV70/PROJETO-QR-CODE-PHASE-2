export interface Ocorrencia {
  codemp: number;
  codfunc: number;
  codparc: number | null;
  nomeFuncionario: string;
  nomeEmpresa: string;
  codHistoCor: number;
  descricaoHistoCor: string;
  dtInicio: string;
  dtFinal: string | null;
  dtPrevRetorno: string | null;
  descricao: string | null;
  cid: string | null;
  departamento: string | null;
  cargo: string | null;
}

export interface OcorrenciaResumo {
  totalAtivas: number;
  porTipo: {
    codHistoCor: number;
    descricao: string;
    quantidade: number;
  }[];
}

export interface OcorrenciaRow {
  codemp: number;
  codfunc: number;
  codparc: number | null;
  nomeFuncionario: string;
  nomeEmpresa: string;
  codHistoCor: number;
  descricaoHistoCor: string;
  dtInicio: string;
  dtFinal: string | null;
  dtPrevRetorno: string | null;
  descricao: string | null;
  cid: string | null;
  departamento: string | null;
  cargo: string | null;
}

export interface OcorrenciaResumoRow {
  totalAtivas: number;
}

export interface OcorrenciaPorTipoRow {
  codHistoCor: number;
  descricao: string;
  quantidade: number;
}
