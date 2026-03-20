export interface FuncionarioCompletoCargaDia {
  diasem: number;
  diasemLabel: string;
  minutosPrevistos: number;
  folga: boolean;
}

export interface FuncionarioCompletoCarga {
  codcargahor: number;
  totalMinutosSemana: number;
  totalHorasSemanaFmt: string;
  dias: FuncionarioCompletoCargaDia[];
}

export interface FuncionarioCompleto {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  telefone: string | null;
  email: string | null;
  codemp: number;
  codfunc: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  codcargahor: number | null;
  salario: number | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
  cargaHoraria: FuncionarioCompletoCarga | null;
}
