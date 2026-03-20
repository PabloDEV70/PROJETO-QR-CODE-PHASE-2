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
