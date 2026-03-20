import { getDaysInMonth, getDate, parseISO } from 'date-fns';

export interface ProjectionResult {
  /** Projected hours for end of month at current pace. */
  projecaoHoras: number;
  /** projecaoHoras / metaMensalHoras × 100 */
  statusPercent: number;
  /** Hours needed per remaining day to hit meta. */
  horasNecessariasDia: number;
  diasRestantes: number;
}

/**
 * Compute end-of-month projection from current pace.
 * Pure function — no side effects.
 */
export function computeProjection(params: {
  mediaHorasProdDia: number;
  dataFim?: string;
  metaMensalHoras: number;
}): ProjectionResult | null {
  const { mediaHorasProdDia, dataFim, metaMensalHoras } = params;
  if (mediaHorasProdDia <= 0 || metaMensalHoras <= 0 || !dataFim) return null;

  const refDate = parseISO(dataFim);
  const daysInMonth = getDaysInMonth(refDate);
  const currentDay = getDate(refDate);
  const diasRestantes = Math.max(daysInMonth - currentDay, 0);

  const projecaoHoras = mediaHorasProdDia * daysInMonth;
  const statusPercent = Math.round((projecaoHoras / metaMensalHoras) * 100);

  const horasJaRealizadas = mediaHorasProdDia * currentDay;
  const horasFaltam = Math.max(metaMensalHoras - horasJaRealizadas, 0);
  const horasNecessariasDia = diasRestantes > 0 ? horasFaltam / diasRestantes : 0;

  return { projecaoHoras, statusPercent, horasNecessariasDia, diasRestantes };
}
