export interface ColaboradorGrid {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  codfunc: number | null;
  codemp: number | null;
  coddep: number | null;
  cargo: string | null;
  departamento: string | null;
  empresa: string | null;
  situacao: string | null;
  situacaoLabel: string | null;
  dtAfastamento: string | null;
  causaAfastamento: number | null;
  feriasInicio: string | null;
  feriasDias: number | null;
  emFerias: boolean;
  temFoto: boolean;
}

export interface DepartamentoOption {
  coddep: number;
  nome: string;
  total: number;
}

export interface OpcaoFiltro {
  id: number;
  label: string;
}

export interface FiltrosOpcoes {
  empresas: OpcaoFiltro[];
  departamentos: OpcaoFiltro[];
  cargos: OpcaoFiltro[];
  funcoes: OpcaoFiltro[];
}
