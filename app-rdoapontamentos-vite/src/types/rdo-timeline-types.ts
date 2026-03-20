// Colaborador Timeline types

export interface ColaboradorTimelineAtividade {
  id: number;
  codrdo: number;
  hrini: string;
  hrfim: string;
  duracaoMinutos: number;
  rdomotivocod: number;
  motivoDescricao: string;
  motivoSigla: string;
  isProdutivo: boolean;
  nuos: number | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  obs: string | null;
}

export interface ColaboradorJornadaInfo {
  jornadaIniPrevisto: string;
  jornadaFimPrevisto: string;
  primeiraAtividade: string;
  ultimaAtividade: string;
  atrasoMin: number;
  saidaAntecipadaMin: number;
  cumpriuJornada: boolean;
}

export interface ColaboradorTimelineDia {
  data: string;
  diaSemana: number;
  diaSemanaLabel: string;
  atividades: ColaboradorTimelineAtividade[];
  resumo: {
    totalMinutos: number;
    minutosProdu: number;
    minutosOutros: number;
    minutosAlmoco: number;
    minutosBanheiro: number;
    motivoMinutos?: Record<string, number>;
    percentProdutivo: number;
  };
  meta: {
    cargaHorariaPrevistaMin: number;
    intervaloAlmocoProgramadoMin: number;
    toleranciaAlmocoExtraMin: number;
    toleranciaBanheiroMin: number;
    almocoRealMin: number;
    almocoDescontadoMin: number;
    almocoExcessoMin: number;
    banheiroRealMin: number;
    banheiroDescontadoMin: number;
    metaEfetivaMin: number;
    minutosContabilizados: number;
    atingiuMeta: boolean;
    percentMeta: number;
    saldoMin: number;
    horaExtraMin: number;
    metaProdutivaMin: number;
    aproveitamentoPercent: number;
    desempenhoPercent: number;
    atingiuMetaProdutiva: boolean;
    gapNaoProdutivoMin: number;
  };
  jornada: ColaboradorJornadaInfo | null;
}

export interface ColaboradorJornadaTurno {
  entrada: string;
  saida: string;
  minutos: number;
}

export interface ColaboradorJornadaDia {
  diasem: number;
  diasemLabel: string;
  folga: boolean;
  totalMin: number;
  turnos: ColaboradorJornadaTurno[];
}

export interface ColaboradorTimelineResponse {
  colaborador: {
    codparc: number;
    nome: string;
    cgcCpf: string | null;
    departamento: string | null;
    cargo: string | null;
    funcao: string | null;
    empresa: string | null;
    fotoUrl: string | null;
  };
  cargaHoraria: {
    inicio: string;
    fim: string;
    intervaloInicio: string;
    intervaloFim: string;
    totalSemanalMin: number;
  } | null;
  jornadaSemanal: ColaboradorJornadaDia[] | null;
  periodo: {
    dataInicio: string;
    dataFim: string;
    totalDias: number;
  };
  dias: ColaboradorTimelineDia[];
  resumoPeriodo: {
    totalMinutosTrabalhados: number;
    totalMinutosProdutivos: number;
    totalMinutosOutros: number;
    totalMinutosAlmoco: number;
    totalMinutosBanheiro: number;
    totalCargaPrevistaMin: number;
    totalMetaEfetivaMin: number;
    totalContabilizadosMin: number;
    totalSaldoMin: number;
    percentProdutivoGeral: number;
    diasAtingiuMeta: number;
    diasNaoAtingiuMeta: number;
    percentDiasComMeta: number;
    mediaDiariaMinutos: number;
    mediaDiariaPercent: number;
    totalHoraExtraMin: number;
    totalDeficitMin: number;
    diasComHoraExtra: number;
    diasComDeficit: number;
    diasCumpriuJornada: number;
    diasNaoCumpriuJornada: number;
    totalAtrasoMin: number;
    totalSaidaAntecipadaMin: number;
    totalMetaProdutivaMin: number;
    totalGapNaoProdutivoMin: number;
    aproveitamentoGeralPercent: number;
    desempenhoGeralPercent: number;
    diasAtingiuMetaProdutiva: number;
    mediaDiariaProdMin: number;
  };
}
