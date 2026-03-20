import type { RdoJornada } from '../../domain/services/rdo-jornada';
import type { MotivoConfigEmbutido } from '../../domain/services/rdo-motivos-config';

export type { RdoJornada, MotivoConfigEmbutido };

export interface ToleranciaItem {
  aplicada: boolean;
  minutos: number;
}

export interface RdoToleranciaResult {
  almoco: ToleranciaItem;
  banheiro: ToleranciaItem;
  fumar: ToleranciaItem;
}

export interface WtCategoriaBreakdown {
  /** DB key: 'wrenchTime', 'desloc', 'espera', 'buro', 'trein', 'pausas', 'externos' */
  categoria: string;
  /** Label em portugues: 'Wrench Time', 'Deslocamento', etc. */
  label: string;
  /** Cor hex: '#16A34A', etc. */
  color: string;
  /** Minutos efetivos apos deducoes (almoco/banheiro so excesso) */
  minutos: number;
  /** Math.round(minutos / tempoNoTrabalho * 100) */
  percent: number;
}

export interface RdoListItem {
  CODRDO: number;
  CODPARC: number | null;
  DTREF: Date | null;
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
  osDataIni: Date | null;
  osPrevisao: Date | null;
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
  motivoMinutos: Record<number, number>;
  /** Pre-computed breakdown por wtCategoria (labels, cores, minutos, percent) */
  wtCategorias: WtCategoriaBreakdown[];
  /** Pre-computed diagnostico faixa with clean label and hex color */
  diagnosticoFaixa: { texto: string; faixa: { label: string; color: string } };
  /** Pre-computed tolerance breakdown (almoco/banheiro/fumar) */
  tolerancias: RdoToleranciaResult;
  /** Pre-computed jornada (horasPrevistas, horasRealizadas, saldo, horaExtra) */
  jornada?: RdoJornada;
  /** Pre-computed config per motivo with wtLabel/wtColor for frontend rendering */
  motivosConfig?: MotivoConfigEmbutido[];
}
