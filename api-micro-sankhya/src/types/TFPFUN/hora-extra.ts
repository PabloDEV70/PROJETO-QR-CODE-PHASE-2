export interface HoraExtraOptions {
  dataInicio?: string;
  dataFim?: string;
  agruparPor?: 'dia' | 'semana' | 'mes';
}

export interface HoraExtraItem {
  item: number;
  hrini: number;
  hrfim: number;
  hriniFormatada: string;
  hrfimFormatada: string;
  duracaoMinutos: number;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  nuos: number | null;
  obs: string | null;
}

export interface HoraExtraDia {
  dtref: string;
  diasem: number;
  diasemLabel: string;
  minutosPrevistos: number;
  minutosApontados: number;
  minutosHoraExtra: number;
  horasHoraExtraFmt: string;
  folga: boolean;
  percentualJornada: number;
  itens: HoraExtraItem[];
}

export interface HoraExtraResumo {
  totalDias: number;
  totalMinutosPrevistos: number;
  totalMinutosApontados: number;
  totalMinutosHoraExtra: number;
  totalHorasHoraExtraFmt: string;
  mediaMinutosDia: number;
  diasComHoraExtra: number;
  diasEmFolga: number;
}

export interface HoraExtraResponse {
  funcionario: {
    codparc: number;
    nomeparc: string;
    cargo: string | null;
    departamento: string | null;
    codcargahor: number | null;
    totalHorasSemanaPrevistas: string | null;
  };
  data: HoraExtraDia[];
  meta: HoraExtraResumo;
}
