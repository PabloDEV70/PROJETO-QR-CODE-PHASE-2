export interface RdoMotivo {
  RDOMOTIVOCOD: number;
  DESCRICAO: string;
  SIGLA: string;
  ATIVO: 'S' | 'N';
  PRODUTIVO: 'S' | 'N';
  TOLERANCIA: number | null;
  PENALIDADE: number | null;
  WTCATEGORIA: string | null;
}

export interface RdoCabecalho {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: string | null;
  nomeparc: string | null;
  departamento: string | null;
  cargo: string | null;
  totalItens: number;
  totalMinutos: number | null;
  totalHoras: number | null;
  primeiraHora: string | null;
  ultimaHora: string | null;
  qtdOs: number | null;
  primeiroNuos: number | null;
  veiculoPlaca: string | null;
  veiculoTag: string | null;
  minutosProdu: number | null;
  minutosNaoProdu: number | null;
  produtividadePercent: number | null;
  atingiuMeta: boolean | null;
  diagnostico: string | null;
  diagnosticoFaixa: { texto: string; faixa: { label: string; color: string } } | null;
}

/* ── Enriched RDO from /rdo/:codrdo/metricas ── */

export interface WtCategoriaBreakdown {
  categoria: string;
  label: string;
  color: string;
  minutos: number;
  percent: number;
}

export interface ToleranciaItem {
  aplicada: boolean;
  minutos: number;
}

export interface RdoToleranciaResult {
  almoco: ToleranciaItem;
  banheiro: ToleranciaItem;
  fumar: ToleranciaItem;
}

export interface RdoJornada {
  horasPrevistas: string;
  horasRealizadas: string;
  saldo: number;
  saldoFormatado: string;
  saldoPositivo: boolean;
  horaExtra: number;
  horaExtraFormatado: string;
}

export interface RdoMetricas {
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
  motivoMinutos: Record<number, number>;
  wtCategorias: WtCategoriaBreakdown[];
  diagnosticoFaixa: { texto: string; faixa: { label: string; color: string } };
  tolerancias: RdoToleranciaResult;
  jornada?: RdoJornada;
}

export interface RdoDetalheItem {
  CODRDO: number;
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  hriniFormatada: string | null;
  hrfimFormatada: string | null;
  duracaoMinutos: number | null;
  RDOMOTIVOCOD: number | null;
  NUOS: number | null;
  osStatus: string | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  OBS: string | null;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  motivoProdutivo: 'S' | 'N' | null;
  motivoCategoria: string | null;
  /* Servico da OS (TCFSERVOS) */
  servicoCodProd: number | null;
  servicoNome: string | null;
  servicoObs: string | null;
  servicoTempo: number | null;
  servicoStatus: string | null;
  osQtdServicos: number | null;
  /* Apontamento de origem (AD_APONTSOL) */
  apontamentoDesc: string | null;
  apontamentoCodProd: number | null;
  apontamentoProdDesc: string | null;
  apontamentoHr: number | null;
}

export interface RdoListParams {
  codparc?: number;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
  comOs?: boolean;
  semOs?: boolean;
  coddep?: number;
  codcargo?: number;
  codfuncao?: number;
  codemp?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface RdoListResponse {
  data: RdoCabecalho[];
  meta: {
    total?: number;
    totalRegistros?: number;
    page: number;
    limit: number;
  };
}

export interface MeusRdosResumo {
  totalDias: number;
  totalHoras: number;
  mediaHorasDia: number;
  percentualProdutivo: number;
}

export interface RdoFormData {
  CODPARC: number;
  DTREF: string;
}

export interface DetalheFormData {
  HRINI: number;
  HRFIM: number;
  RDOMOTIVOCOD: number;
  NUOS?: number | null;
  OBS?: string | null;
}
