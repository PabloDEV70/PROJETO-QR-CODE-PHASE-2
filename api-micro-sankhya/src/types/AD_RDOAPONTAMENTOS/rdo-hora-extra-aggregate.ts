export interface HoraExtraPorColaborador {
  codparc: number;
  nomeparc: string;
  departamento: string | null;
  cargo: string | null;
  totalHoraExtraMin: number;
  diasComHoraExtra: number;
  totalDias: number;
  mediaHoraExtraMinDia: number;
}

export interface HoraExtraPorDepartamento {
  coddep: number | null;
  departamento: string | null;
  totalHoraExtraMin: number;
  totalColaboradores: number;
  mediaHoraExtraMinPorColab: number;
}

export interface RdoHoraExtraAggregate {
  data: {
    porColaborador: HoraExtraPorColaborador[];
    porDepartamento: HoraExtraPorDepartamento[];
  };
  meta: {
    totalHoraExtraMin: number;
    totalColaboradores: number;
    periodo: string;
  };
}
