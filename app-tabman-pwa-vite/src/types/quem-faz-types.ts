export interface QuemFazRow {
  CODRDO: number;
  CODPARC: number;
  nomeparc: string | null;
  nomeusu: string | null;
  departamento: string | null;
  cargo: string | null;
  ultItem: number | null;
  ultHrini: number | null;
  ultHrfim: number | null;
  ultMotivoCod: number | null;
  ultMotivoSigla: string | null;
  ultMotivoDesc: string | null;
  ultMotivoProdutivo: string | null;
  ultMotivoCategoria: string | null;
  /* OS data */
  ultNuos: number | null;
  ultSequenciaOs: number | null;
  ultOsStatus: string | null;
  ultOsTipo: string | null;
  ultOsManutencao: string | null;
  /* Vehicle data */
  ultOsPlaca: string | null;
  ultOsModelo: string | null;
  ultOsTag: string | null;
  ultOsTipoEqpto: string | null;
  /* Service data */
  ultSrvCodProd: number | null;
  ultSrvNome: string | null;
  ultSrvStatus: string | null;
  ultSrvTempo: number | null;
  osAtivasCount: number;
}

/** Whether the row represents an ongoing (non-closed) activity */
export function isOngoing(row: QuemFazRow): boolean {
  if (row.ultHrini == null || row.ultHrfim == null) return false;
  return row.ultHrfim === row.ultHrini + 1;
}

/** Elapsed minutes since HRINI (HHMM format) */
export function elapsedMinutes(hrini: number | null): number {
  if (hrini == null) return 0;
  const h = Math.floor(hrini / 100);
  const m = hrini % 100;
  const now = new Date();
  return Math.max(0, (now.getHours() * 60 + now.getMinutes()) - (h * 60 + m));
}
