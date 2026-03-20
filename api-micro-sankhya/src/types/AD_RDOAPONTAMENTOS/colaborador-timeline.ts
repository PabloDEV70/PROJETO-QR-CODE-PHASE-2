/**
 * Timeline de atividades por colaborador com cálculo de metas
 *
 * Regras de meta:
 * - Almoço (RDOMOTIVOCOD=3): desconta no min(max(real, programado), programado+10)
 * - Banheiro (RDOMOTIVOCOD=2): desconsiderar 10min da meta (o que passar abate)
 */

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
    motivoMinutos: Record<number, number>;
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

export interface ColaboradorTimelineOptions {
  codparc: number;
  dataInicio: string;
  dataFim: string;
}

// Almoco mantido por logica estrutural unica (TFPHOR inter-shift gap)
export const MOTIVO_ALMOCO = 3;

/**
 * Modos de calculo de produtividade.
 *
 * AMPLO:   Todos os motivos sao produtivos EXCETO os com tolerancia/penalidade e almoco.
 * ESTRITO: Somente motivos marcados PRODUTIVO='S' no DB sao produtivos.
 *
 * Regras comuns (ambos os modos):
 * - Motivos com PENALIDADE: penalidade fixa por ocorrencia (do DB)
 * - ALMOCO (3): desconta intervalo intrajornada programado + tolerancia extra (do DB)
 * - Motivos com TOLERANCIA: tolerancia gratis, excesso abate (do DB)
 */
export type ProdutividadeMode = 'AMPLO' | 'ESTRITO';

/** Modo ativo — trocar aqui para alternar o calculo */
export const PRODUTIVIDADE_MODE: ProdutividadeMode = 'ESTRITO';
