import type { WtCategoriaBreakdown } from './wt-categoria-types';
import type { RdoDiagnostico, RdoTolerancias } from './diagnostico-types';
import type { RdoJornada, MotivoConfigEmbutido } from './jornada-types';
// RDO list item (1 row per RDO, from GET /rdo)
export interface RdoListItem {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: string | null;
  nomeparc: string | null;
  departamento: string | null;
  cargo: string | null;
  totalItens: number;
  totalMinutos: number;
  totalHoras: number;
  primeiraHora: string | null;
  ultimaHora: string | null;
  qtdOs: number;
  primeiroNuos: number | null;
  osStatus: string | null;
  osManutencao: string | null;
  osStatusGig: string | null;
  osDataIni: string | null;
  osPrevisao: string | null;
  osQtdServicos: number | null;
  veiculoPlaca: string | null;
  veiculoTag: string | null;
  veiculoModelo: string | null;
  codcargahor: number | null;
  minutosPrevistosDia: number;
  horasJornadaEsperada: number;
  minutosProdu: number;
  minutosNaoProdu: number;
  minutosFumarPenalidade: number;
  produtividadePercent: number;
  atingiuMeta: boolean;
  metaEfetivaMin: number;
  totalBrutoMin: number;
  almocoQtd: number;
  almocoMin: number;
  almocoDescontadoMin: number;
  banheiroQtd: number;
  banheiroMin: number;
  banheiroDescontadoMin: number;
  fumarQtd: number;
  fumarMinReal: number;
  intervaloAlmocoMin: number;
  horaExtraMin: number;
  minutosContabilizados: number;
  tempoNoTrabalho: number;
  saldoJornadaMin: number;
  diagnostico: string;
  /** Per-motivo minute totals: { [rdomotivocod]: totalMinutos } */
  motivoMinutos?: Record<string, number>;
  wtCategorias?: WtCategoriaBreakdown[];
  diagnosticoFaixa?: RdoDiagnostico;
  tolerancias?: RdoTolerancias;
  jornada?: RdoJornada;
  motivosConfig?: MotivoConfigEmbutido[];
}
export interface RdoListResponse {
  data: RdoListItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}

export interface RdoListParams {
  page?: number;
  limit?: number;
  dataInicio?: string;
  dataFim?: string;
  codparc?: string;
  comOs?: boolean;
  semOs?: boolean;
  coddep?: string;
  codcargo?: string;
  codfuncao?: string;
  codemp?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface RdoDetalhePeriodo {
  CODRDO: number;
  DTREF: string | null;
  CODPARC: number | null;
  nomeparc: string | null;
  cgc_cpf: string | null;
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  hriniFormatada: string | null;
  hrfimFormatada: string | null;
  duracaoMinutos: number | null;
  RDOMOTIVOCOD: number | null;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  NUOS: number | null;
  osStatus: string | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  OBS: string | null;
  coddep: number | null;
  departamento: string | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  codemp: number | null;
  empresa: string | null;
}

export interface RdoDetalhesResponse {
  data: RdoDetalhePeriodo[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
    totalMinutos: number;
    totalHoras: number;
  };
}

export interface RdoDetalhesParams {
  page?: number;
  limit?: number;
  dataInicio?: string;
  dataFim?: string;
  codparc?: string; // "3396,566" (include) or "!100" (exclude)
  rdomotivocod?: string;
  comOs?: boolean;
  semOs?: boolean;
  coddep?: string;
  codcargo?: string;
  codfuncao?: string;
  codemp?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface RdoCompleto {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: string | null;
  nomeparc: string | null;
  cgc_cpf: string | null;
  totalItens: number;
  totalMinutos: number | null;
  totalHoras: number | null;
}

export interface RdoDetalheCompleto {
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  hriniFormatada: string | null;
  hrfimFormatada: string | null;
  duracaoMinutos: number | null;
  RDOMOTIVOCOD: number | null;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  NUOS: number | null;
  osStatus: string | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  OBS: string | null;
}
// Funcionario for selection
export interface Funcionario {
  codparc: number;
  nomeparc: string;
  cgc_cpf?: string;
  departamento?: string;
  cargo?: string;
}
// Re-export analytics types
export type { RdoAnalyticsResumo, RdoAnalyticsProdutividade, RdoAnalyticsMotivo,
  RdoTimelinePoint, RdoPeriodMetrics, RdoComparativo, RdoAnalyticsEficiencia,
  RdoFiltroOpcao, RdoFiltrosOpcoes, HoraExtraPorColaborador, HoraExtraPorDepartamento,
  RdoHoraExtraAggregate, AssiduidadePorColaborador, RdoAssiduidadeAggregate,
} from './rdo-analytics-types';
// Re-export colaborador timeline types
export type { ColaboradorTimelineAtividade, ColaboradorJornadaInfo, ColaboradorTimelineDia,
  ColaboradorJornadaTurno, ColaboradorJornadaDia, ColaboradorTimelineResponse,
} from './rdo-timeline-types';
// Re-export jornada types
export type { RdoJornada, MotivoConfigEmbutido } from './jornada-types';
