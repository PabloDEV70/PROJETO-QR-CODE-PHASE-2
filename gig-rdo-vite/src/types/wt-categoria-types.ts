/** Pre-computed wtCategoria breakdown item emitido pela API */
export interface WtCategoriaBreakdown {
  /** DB key: 'wrenchTime', 'desloc', 'espera', 'buro', 'trein', 'pausas', 'externos' */
  categoria: string;
  /** Label em portugues: 'Wrench Time', 'Deslocamento', etc. */
  label: string;
  /** Cor hex: '#16A34A', etc. */
  color: string;
  /** Minutos efetivos apos deducoes */
  minutos: number;
  /** Math.round(minutos / tempoNoTrabalho * 100) */
  percent: number;
}
