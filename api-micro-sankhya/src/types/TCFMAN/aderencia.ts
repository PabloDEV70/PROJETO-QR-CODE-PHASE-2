/**
 * Análise de aderência a um plano de manutenção
 */
export interface AderenciaPlano {
  nuplano: number;
  descricao: string | null;
  tipo: string | null;
  intervaloDias: number | null;
  intervaloKm: number | null;
  codveiculo: number;
  placa: string | null;
  ultimaManutencao: Date | null;
  diasDesdeUltima: number | null;
  situacao: 'ATRASADA' | 'PROXIMA' | 'EM_DIA' | 'SEM_HISTORICO';
  diasAtraso: number | null;
}

/**
 * Manutenção preventiva atrasada
 */
export interface ManutencaoAtrasada {
  nuplano: number;
  descricao: string | null;
  intervaloDias: number | null;
  codveiculo: number;
  placa: string | null;
  ultimaManutencao: Date | null;
  diasDesdeUltima: number;
  diasAtraso: number;
}

/**
 * Resumo de aderência aos planos
 */
export interface ResumoAderencia {
  totalPlanos: number;
  emDia: number;
  proximas: number;
  atrasadas: number;
  semHistorico: number;
  percentualEmDia: number;
}
