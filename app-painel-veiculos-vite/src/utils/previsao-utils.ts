import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export interface PrevisaoInfo {
  text: string;
  isOverdue: boolean;
}

function safeDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(NaN);
}

export function calcPrevisaoCountdown(dtprevisao: string | null): PrevisaoInfo | null {
  if (!dtprevisao) return null;

  const target = safeDate(dtprevisao);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diffMin = differenceInMinutes(target, now);

  if (diffMin < 0) {
    const overMin = Math.abs(diffMin);
    if (overMin < 60) return { text: `${overMin}m atrasado`, isOverdue: true };
    const overH = differenceInHours(now, target);
    if (overH < 24) return { text: `${overH}h atrasado`, isOverdue: true };
    const overD = differenceInDays(now, target);
    return { text: `${overD}d atrasado`, isOverdue: true };
  }

  if (diffMin < 60) return { text: `${diffMin}m`, isOverdue: false };
  const hours = differenceInHours(target, now);
  if (hours < 24) return { text: `${hours}h`, isOverdue: false };
  const days = differenceInDays(target, now);
  return { text: `${days}d ${hours % 24}h`, isOverdue: false };
}
