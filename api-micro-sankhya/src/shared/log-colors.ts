import { env } from '@/config/env';

export const isDev = env.NODE_ENV !== 'production';

// ANSI codes
export const R = '\x1b[0m';
export const B = '\x1b[1m';
export const D = '\x1b[2m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m';
export const RED = '\x1b[31m';
export const CYAN = '\x1b[36m';
export const MAGENTA = '\x1b[35m';
export const WHITE = '\x1b[37m';
export const BLUE = '\x1b[34m';
export const BLACK = '\x1b[30m';
export const BG_RED = '\x1b[41m';
export const BG_YELLOW = '\x1b[43m';
export const BG_GREEN = '\x1b[42m';
export const BG_CYAN = '\x1b[46m';
export const BG_MAGENTA = '\x1b[45m';
export const BG_BLUE = '\x1b[44m';

export function clock(): string {
  const n = new Date();
  const h = String(n.getHours()).padStart(2, '0');
  const m = String(n.getMinutes()).padStart(2, '0');
  const s = String(n.getSeconds()).padStart(2, '0');
  return `${D}${h}:${m}:${s}${R}`;
}

export function msText(ms: number, pad = 7): string {
  const val = `${ms}ms`.padStart(pad);
  if (ms > 5000) return `${RED}${B}${val}${R}`;
  if (ms > 2000) return `${YELLOW}${val}${R}`;
  if (ms > 500)  return `${WHITE}${val}${R}`;
  return `${D}${val}${R}`;
}

export function devLog(line: string): void {
  if (isDev) process.stdout.write(`${line}\n`);
}
