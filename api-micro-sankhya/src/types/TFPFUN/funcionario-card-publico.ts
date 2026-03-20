export interface FuncionarioCardPublico {
  codemp: number;
  codfunc: number;
  nome: string;
  cargo: string | null;
  funcao: string | null;
  departamento: string | null;
  empresa: string | null;
  situacao: string;
  situacaoLabel: string;
  dtadm: string | null;
}

export interface CardPublicoRow {
  CODEMP: number;
  CODFUNC: number;
  SITUACAO: string;
  DTADM: string | null;
  NOME: string;
  CARGO: string | null;
  FUNCAO: string | null;
  DEPARTAMENTO: string | null;
  EMPRESA: string | null;
}
