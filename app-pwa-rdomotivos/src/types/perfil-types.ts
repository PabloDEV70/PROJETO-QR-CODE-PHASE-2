export interface CargaHorariaTurno {
  entrada: string;
  saida: string;
  minutos: number;
}

export interface CargaHorariaDia {
  diasem: number;
  diasemLabel: string;
  minutosPrevistos: number;
  folga: boolean;
  turnos: CargaHorariaTurno[];
}

export interface CargaHoraria {
  codcargahor: number;
  descricao: string | null;
  totalMinutosSemana: number;
  totalHorasSemanaFmt: string;
  dias: CargaHorariaDia[];
}

export interface VinculoAtual {
  codemp: number;
  codfunc: number;
  situacao: string;
  situacaoLabel: string;
  dtadm: string;
  dtdem: string | null;
  cargo: string | null;
  funcao: string | null;
  departamento: string | null;
  empresa: string | null;
  salario: number | null;
  coddep: number | null;
  codcargo: number | null;
  codfuncao: number | null;
  codcargahor: number | null;
}

export interface PerfilEnriquecido {
  codparc: number;
  nomeparc: string;
  cgcCpf: string | null;
  dtNascimento: string | null;
  telefone: string | null;
  email: string | null;
  papeis: {
    funcionario: boolean;
    usuario: boolean;
    cliente: boolean;
    fornecedor: boolean;
  };
  vinculoAtual: VinculoAtual | null;
  cargaHoraria: CargaHoraria | null;
}
