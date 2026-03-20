// Analytics summary from /rdo/analytics/resumo
export interface RdoAnalyticsResumo {
  totalRdos: number;
  totalDetalhes: number;
  totalColaboradores: number;
  totalHoras: number;
  /** Total de minutos previstos pela jornada de trabalho (TFPHOR) */
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

// Productivity analytics from /rdo/analytics/produtividade
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

// Motivo distribution from /rdo/analytics/motivos
export interface RdoAnalyticsMotivo {
  rdomotivocod: number;
  descricao: string;
  sigla: string;
  produtivo: 'S' | 'N' | null;
  tolerancia: number | null;
  penalidadeMin: number | null;
  totalItens: number;
  /** Distinct RDOs that had at least one apontamento with this motivo */
  rdosComMotivo: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  percentualDoTotal: number;
  toleranciaProgramadaTotalMin: number;
  /** Category from DB (AD_RDOMOTIVOS.WTCATEGORIA) */
  wtCategoria?: string;
}

/** Wrench Time deduction summary computed by backend */
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

/** Full response from /rdo/analytics/motivos */
export interface RdoMotivosResponse {
  data: RdoAnalyticsMotivo[];
  meta: { total: number; totalHoras: number };
  wtSummary: RdoWtSummary;
}

// Timeline analytics from /rdo/analytics/timeline
export interface RdoTimelinePoint {
  DTREF: string;
  totalRdos: number;
  totalColaboradores: number;
  totalItens: number;
  totalHoras: number;
  /** Horas do motivo ATVP (cod=1) — base para produtividade ESTRITO */
  horasProdutivas: number;
  itensComOs: number;
  /** Jornada prevista para este dia (min), baseada em TFPHOR por DIASEM */
  minutosPrevistos: number;
  /** Hora extra total (min) — computada por colaborador antes de agregar */
  minutosHoraExtra: number;
  /** Hora extra produtiva (min) */
  minutosHoraExtraProd: number;
  /** Hora extra nao-produtiva (min) */
  minutosHoraExtraNaoProd: number;
}

// Per-day per-motivo minutes from /rdo/analytics/timeline/motivos
export interface RdoTimelineMotivoRow {
  DTREF: string;
  rdomotivocod: number;
  wtCategoria: string;
  totalMinutos: number;
}

// Period metrics for comparison
export interface RdoPeriodMetrics {
  totalRdos: number;
  totalColaboradores: number;
  totalDetalhes: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  itensComOs: number;
  diasComDados: number;
}

// Period comparison from /rdo/analytics/comparativo
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

// Efficiency analytics from /rdo/analytics/eficiencia
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

// Filter options from /rdo/analytics/filtros-opcoes
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

// Hora extra from /rdo/analytics/hora-extra
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

// Anomalia detection from /rdo/analytics/anomalias
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

// Assiduidade from /rdo/analytics/assiduidade
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
