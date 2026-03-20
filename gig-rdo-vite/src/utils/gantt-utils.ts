import type { ColaboradorTimelineAtividade } from '@/types/rdo-timeline-types';

export function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

export const DAY_START = 6 * 60;
export const DAY_END = 20 * 60;
const DAY_SPAN = DAY_END - DAY_START;

export function minutesToPercent(minutes: number): number {
  return ((minutes - DAY_START) / DAY_SPAN) * 100;
}

export const HOUR_MARKERS = Array.from({ length: 15 }, (_, i) => 6 + i);

export const COLORS = {
  produtivo: { main: '#10b981', dark: '#059669' },
  outros: { main: '#f59e0b', dark: '#d97706' },
  almoco: { main: '#8b5cf6', dark: '#7c3aed' },
  banheiro: { main: '#06b6d4', dark: '#0891b2' },
  gap: { main: '#ef4444' },
  carga: { main: '#6366f1' },
  horaExtra: { main: '#ed6c02', bg: 'rgba(237, 108, 2, 0.08)' },
  meta: {
    atingida: { main: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    naoAtingida: { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
  },
};

export function getAtividadeColor(rdomotivocod: number, isProdutivo: boolean) {
  if (isProdutivo) return COLORS.produtivo;
  if (rdomotivocod === 3) return COLORS.almoco;
  if (rdomotivocod === 2) return COLORS.banheiro;
  return COLORS.outros;
}

export function parseDateSafe(dateStr: string): Date {
  const dateOnly = dateStr.split('T')[0] ?? dateStr;
  return new Date(dateOnly + 'T12:00:00');
}

export function formatMinutos(min: number): string {
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

export function formatMinutosSigned(min: number): string {
  if (min === 0) return '0min';
  const sign = min > 0 ? '+' : '-';
  return `${sign}${formatMinutos(min)}`;
}

export interface CargaHoraria {
  inicio: string;
  fim: string;
  intervaloInicio: string;
  intervaloFim: string;
}

export function detectGaps(
  atividades: ColaboradorTimelineAtividade[],
  cargaHoraria: CargaHoraria | null,
): { inicio: number; fim: number }[] {
  const gaps: { inicio: number; fim: number }[] = [];
  const sorted = [...atividades].sort(
    (a, b) => timeToMinutes(a.hrini) - timeToMinutes(b.hrini),
  );
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]!;
    const next = sorted[i + 1]!;
    const currentEnd = timeToMinutes(current.hrfim);
    const nextStart = timeToMinutes(next.hrini);
    const isLunch = cargaHoraria
      ? currentEnd >= timeToMinutes(cargaHoraria.intervaloInicio) &&
        nextStart <= timeToMinutes(cargaHoraria.intervaloFim)
      : false;
    if (nextStart - currentEnd > 15 && !isLunch) {
      gaps.push({ inicio: currentEnd, fim: nextStart });
    }
  }
  return gaps;
}
