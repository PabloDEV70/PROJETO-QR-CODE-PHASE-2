import { getCategoryMeta, fmtMin } from '@/utils/wrench-time-categories';
import type { ColaboradorTimelineDia } from '@/types/rdo-types';

export interface Segment {
  s: number; e: number; dur: number;
  label: string; color: string; catKey: string;
}

export function hrToMin(hr: string): number {
  const parts = hr.split(':');
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  const n = Number(hr);
  return Math.floor(n / 100) * 60 + (n % 100);
}

export function minToHr(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function guessCategory(sigla: string): string {
  const s = sigla.toUpperCase();
  if (s.includes('ALM') || s.includes('BAN') || s.includes('CAFE')) return 'pausas';
  if (s.includes('DESL') || s.includes('TRANSL')) return 'desloc';
  if (s.includes('ESPE') || s.includes('AGUAR')) return 'espera';
  if (s.includes('DDS') || s.includes('TREIN') || s.includes('SEGUR')) return 'trein';
  if (s.includes('BURO') || s.includes('ADMIN') || s.includes('ALINHA')) return 'buro';
  if (s.includes('CHUV') || s.includes('CLIMA')) return 'externos';
  return 'pausas';
}

export function buildSegments(dia: ColaboradorTimelineDia): Segment[] {
  return dia.atividades
    .map((a) => {
      const s = hrToMin(a.hrini);
      const e = hrToMin(a.hrfim);
      const dur = e > s ? e - s : 0;
      const catKey = a.isProdutivo ? 'wrenchTime' : guessCategory(a.motivoSigla);
      const meta = getCategoryMeta(catKey);
      return { s, e, dur, label: `${a.motivoSigla} (${fmtMin(dur)})`, color: meta.color, catKey };
    })
    .filter((seg) => seg.dur > 0)
    .sort((a, b) => a.s - b.s);
}

export function buildHourTicks(dayStart: number, dayEnd: number): number[] {
  const firstHour = Math.ceil(dayStart / 60) * 60;
  const ticks: number[] = [];
  for (let t = firstHour; t <= dayEnd; t += 60) {
    if (t > dayStart && t < dayEnd) ticks.push(t);
  }
  return ticks;
}

export function buildGaps(segments: Segment[]): { s: number; dur: number }[] {
  const gaps: { s: number; dur: number }[] = [];
  for (let i = 1; i < segments.length; i++) {
    const gapStart = segments[i - 1]!.e;
    const gapEnd = segments[i]!.s;
    if (gapEnd - gapStart > 2) gaps.push({ s: gapStart, dur: gapEnd - gapStart });
  }
  return gaps;
}
