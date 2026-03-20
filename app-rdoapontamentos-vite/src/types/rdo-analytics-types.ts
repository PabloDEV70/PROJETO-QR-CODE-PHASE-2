export interface RdoAnalyticsResumo {
  totalRdos: number;
  totalDetalhes: number;
  totalColaboradores: number;
  totalHoras: number;
  totalMinutosPrevistos: number;
  mediaHorasDia: number;
  mediaHorasPorColabDia: number;
  mediaRdosPorColab: number;
  mediaItensPorRdo: number;
  diasComDados: number;
  topMotivo: string;
  topMotivoSigla: string;
  topMotivoPercentual: number;
  percentualComOs: number;
}

export interface RdoAnalyticsProdutividade {
  codparc: number;
  nomeparc: string;
  totalRdos: number;
  totalItens: number;
  totalMinutos: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  mediaHorasPorRdo: number;
  desvioPadrao: number;
  itensCurtos: number;
  percentualCurtos: number;
  itensComOs: number;
  itensSemOs: number;
  percentualComOs: number;
  departamento: string | null;
  cargo: string | null;
}

export interface RdoAnalyticsMotivo {
  rdomotivocod: number;
  descricao: string;
  sigla: string;
  produtivo: 'S' | 'N' | null;
  tolerancia: number | null;
  penalidadeMin: number | null;
  totalItens: number;
  rdosComMotivo: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  percentualDoTotal: number;
  toleranciaProgramadaTotalMin: number;
  wtCategoria?: string;
}

export interface RdoWtSummary {
  almocoTotalMin: number;
  almocoProgramadoMin: number;
  almocoExcessoMin: number;
  banheiroTotalMin: number;
  banheiroToleranciaMin: number;
  banheiroExcessoMin: number;
  totalRdos: number;
  totalBrutoMin: number;
  baseEfetivaMin: number;
}

export interface RdoMotivosResponse {
  data: RdoAnalyticsMotivo[];
  meta: { total: number; totalHoras: number };
  wtSummary: RdoWtSummary;
}

export interface RdoTimelinePoint {
  DTREF: string;
  totalRdos: number;
  totalColaboradores: number;
  totalItens: number;
  totalHoras: number;
  horasProdutivas: number;
  itensComOs: number;
  minutosPrevistos: number;
  minutosHoraExtra: number;
  minutosHoraExtraProd: number;
  minutosHoraExtraNaoProd: number;
}

export interface RdoTimelineMotivoRow {
  DTREF: string;
  rdomotivocod: number;
  wtCategoria: string;
  totalMinutos: number;
}

export interface RdoPeriodMetrics {
  totalRdos: number;
  totalColaboradores: number;
  totalDetalhes: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  itensComOs: number;
  diasComDados: number;
}

export interface RdoComparativo {
  atual: RdoPeriodMetrics;
  anterior: RdoPeriodMetrics;
  deltas: {
    totalRdos: number;
    totalColaboradores: number;
    totalHoras: number;
    mediaMinutosPorItem: number;
    percentualComOs: number;
  };
}

export interface RdoAnalyticsEficiencia {
  codparc: number;
  nomeparc: string;
  totalItens: number;
  totalRdos: number;
  mediaMinutosPorItem: number;
  desvioPadrao: number;
  itensCurtos: number;
  percentualCurtos: number;
  motivosDiferentes: number;
  mediaItensPorRdo: number;
}

export interface RdoFiltroOpcao {
  codigo: number;
  nome: string;
  qtdColaboradores?: number;
}

export interface RdoFiltrosOpcoes {
  departamentos: RdoFiltroOpcao[];
  cargos: RdoFiltroOpcao[];
  funcoes: RdoFiltroOpcao[];
  empresas: RdoFiltroOpcao[];
}

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

export interface RdoAnomalia {
  DTREF: string;
  CODPARC: number;
  NOMEPARC: string;
  CODRDO: number;
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  motivo: string | null;
  minutos: number;
  tipoAnomalia: string;
}

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

export interface ColabRanking {
  codparc: number;
  nomeparc: string;
  departamento: string;
  cargo: string;
  totalRdos: number;
  minutosProdu: number;
  tempoNoTrabalho: number;
  produtividadePercent: number;
  horaExtraMin: number;
  diagnostico: string;
}

export interface ColabOvertimeRanking {
  codparc: number;
  nomeparc: string;
  departamento: string;
  cargo: string;
  totalRdos: number;
  horaExtraMin: number;
  diasComHE: number;
}
