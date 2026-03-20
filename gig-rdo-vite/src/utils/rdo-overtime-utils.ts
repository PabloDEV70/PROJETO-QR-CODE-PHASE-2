import type { RdoListItem } from '@/types/rdo-types';
import type { FuncionarioCompletoCargaDia } from '@/types/funcionario-types';

export function getExtraMinutos(
  row: RdoListItem,
  cargaDias?: FuncionarioCompletoCargaDia[],
): number | null {
  if (!cargaDias || !row.DTREF) return null;
  const dateOnly = row.DTREF.split('T')[0];
  const dayOfWeek = new Date(dateOnly + 'T12:00:00').getDay(); // 0=Sun
  const diasem = dayOfWeek + 1; // Sankhya: 1=Dom, 2=Seg, ...
  const dia = cargaDias.find((d) => d.diasem === diasem);
  const previsto = dia?.minutosPrevistos || 0;
  return row.totalMinutos - previsto;
}
