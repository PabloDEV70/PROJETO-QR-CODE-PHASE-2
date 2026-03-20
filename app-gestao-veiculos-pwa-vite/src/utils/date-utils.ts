import { differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { format, formatDistanceToNow } from 'date-fns';

function safeDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(NaN);
}

export { safeDate };

export function formatElapsedTime(dateValue: unknown): string {
  if (!dateValue) return '-';
  
  const date = safeDate(dateValue);
  if (isNaN(date.getTime())) return '-';
  
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateValue: unknown, formatStr = 'dd/MM/yyyy HH:mm'): string {
  if (!dateValue) return '-';
  
  const date = safeDate(dateValue);
  if (isNaN(date.getTime())) return '-';
  
  try {
    return format(date, formatStr, { locale: ptBR });
  } catch {
    return '-';
  }
}

export function formatRelativeTime(dateValue: unknown): { text: string; isPast: boolean } | null {
  if (!dateValue) return null;
  
  const date = safeDate(dateValue);
  if (isNaN(date.getTime())) return null;
  
  const now = new Date();
  const diffMin = differenceInMinutes(date, now);
  
  if (diffMin < 0) {
    const absMin = Math.abs(diffMin);
    if (absMin < 60) return { text: `${absMin}m atr`, isPast: true };
    const hours = Math.abs(differenceInHours(now, date));
    if (hours < 24) return { text: `${hours}h atr`, isPast: true };
    const days = Math.abs(differenceInDays(now, date));
    if (days < 30) return { text: `${days}d atr`, isPast: true };
    const months = Math.abs(differenceInMonths(now, date));
    return { text: `${months}mes atr`, isPast: true };
  }
  
  if (diffMin < 60) return { text: `${diffMin}m`, isPast: false };
  const hours = differenceInHours(date, now);
  if (hours < 24) return { text: `${hours}h`, isPast: false };
  const days = differenceInDays(date, now);
  if (days < 30) return { text: `${days}d`, isPast: false };
  const months = differenceInMonths(date, now);
  return { text: `${months}mes`, isPast: false };
}
