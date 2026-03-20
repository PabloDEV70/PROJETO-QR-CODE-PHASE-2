// --- Raw types from SQL queries ---

export interface FuncionarioAtivoRaw {
  CODEMP: number;
  CODFUNC: number;
  NOMEFUNC: string;
  DTADM: string;
  CODPARC: number;
  CODDEP: number;
  CODCARGAHOR: number | null;
}

export interface HorarioSemanalRaw {
  CODCARGAHOR: number;
  DIASEM: number;
  minutosDia: number;
}

export interface AusenciaRaw {
  CODEMP: number;
  CODFUNC: number;
  dtInicio: string;
  numDias: number;
  tipo: 'FERIAS' | 'AFASTAMENTO';
}

export interface FeriadoRaw {
  dtFeriado: string;
  descricao: string;
}

// --- Response types ---

export interface HorasEsperadasFuncionario {
  codemp: number;
  codfunc: number;
  codparc: number;
  nomefunc: string;
  coddep: number;
  codcargahor: number | null;
  dtadm: string;
  diasUteis: number;
  diasExcluidos: number;
  minutosEsperados: number;
  horasEsperadas: number;
  ausencias: { tipo: string; dias: number }[];
}

export interface HorasEsperadasResumo {
  totalFuncionarios: number;
  totalMinutosEsperados: number;
  totalHorasEsperadas: number;
  totalDiasUteis: number;
  totalDiasExcluidos: number;
  mediaHorasPorFuncionario: number;
}

export interface HorasEsperadasResponse {
  data: HorasEsperadasFuncionario[];
  resumo: HorasEsperadasResumo;
  feriados: { data: string; descricao: string }[];
  periodo: { dataInicio: string; dataFim: string };
}

export interface HorasEsperadasOptions {
  dataInicio: string;
  dataFim: string;
  coddep?: string;
  codemp?: string;
  codparc?: string;
}
