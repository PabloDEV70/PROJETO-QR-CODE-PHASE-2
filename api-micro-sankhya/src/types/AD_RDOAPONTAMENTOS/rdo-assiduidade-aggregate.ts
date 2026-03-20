export interface AssiduidadePorColaborador {
  codparc: number;
  nomeparc: string;
  departamento: string | null;
  totalDias: number;
  diasCumpriuJornada: number;
  percentCumprimento: number;
  totalAtrasoMin: number;
  mediaAtrasoMin: number;
  diasComAtraso: number;
}

export interface RdoAssiduidadeAggregate {
  data: AssiduidadePorColaborador[];
  meta: {
    totalColaboradores: number;
    mediaCumprimentoPercent: number;
    mediaAtrasoGeral: number;
    periodo: string;
  };
}
