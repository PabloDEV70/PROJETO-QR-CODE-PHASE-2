export interface HorasEsperadasResumo {
  totalFuncionarios: number;
  totalMinutosEsperados: number;
  totalHorasEsperadas: number;
  totalDiasUteis: number;
  totalDiasExcluidos: number;
  mediaHorasPorFuncionario: number;
}

export interface HorasEsperadasResponse {
  resumo: HorasEsperadasResumo;
  periodo: { dataInicio: string; dataFim: string };
}

export interface HorasEsperadasParams {
  dataInicio: string;
  dataFim: string;
  coddep?: string;
  codparc?: string;
}
