import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToPercent,
  DAY_START,
  DAY_END,
  formatMinutos,
  formatMinutosSigned,
  getAtividadeColor,
  COLORS,
  parseDateSafe,
} from './gantt-utils';

describe('timeToMinutes', () => {
  it('converts HH:MM to total minutes', () => {
    expect(timeToMinutes('08:30')).toBe(510);
  });

  it('converts midnight', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converts end of day', () => {
    expect(timeToMinutes('23:59')).toBe(1439);
  });

  it('handles single digit hours', () => {
    expect(timeToMinutes('6:00')).toBe(360);
  });
});

describe('minutesToPercent', () => {
  it('returns 0% at DAY_START', () => {
    expect(minutesToPercent(DAY_START)).toBe(0);
  });

  it('returns 100% at DAY_END', () => {
    expect(minutesToPercent(DAY_END)).toBe(100);
  });

  it('returns 50% at midpoint', () => {
    const mid = (DAY_START + DAY_END) / 2;
    expect(minutesToPercent(mid)).toBe(50);
  });
});

describe('formatMinutos', () => {
  it('formats minutes only when < 60', () => {
    expect(formatMinutos(45)).toBe('45min');
  });

  it('formats hours only when exact hours', () => {
    expect(formatMinutos(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatMinutos(90)).toBe('1h30m');
  });

  it('handles zero', () => {
    expect(formatMinutos(0)).toBe('0min');
  });

  it('handles negative values (uses absolute)', () => {
    expect(formatMinutos(-90)).toBe('1h30m');
  });
});

describe('formatMinutosSigned', () => {
  it('returns zero without sign', () => {
    expect(formatMinutosSigned(0)).toBe('0min');
  });

  it('adds + for positive', () => {
    expect(formatMinutosSigned(30)).toBe('+30min');
  });

  it('adds - for negative', () => {
    expect(formatMinutosSigned(-60)).toBe('-1h');
  });
});

describe('getAtividadeColor', () => {
  it('returns produtivo color when isProdutivo is true', () => {
    expect(getAtividadeColor(1, true)).toBe(COLORS.produtivo);
  });

  it('returns almoco color for motivo 3', () => {
    expect(getAtividadeColor(3, false)).toBe(COLORS.almoco);
  });

  it('returns banheiro color for motivo 2', () => {
    expect(getAtividadeColor(2, false)).toBe(COLORS.banheiro);
  });

  it('returns outros for other non-produtivo motivos', () => {
    expect(getAtividadeColor(5, false)).toBe(COLORS.outros);
  });
});

describe('parseDateSafe', () => {
  it('strips time portion and returns Date at noon', () => {
    const d = parseDateSafe('2026-02-15T10:30:00');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(1); // February = 1
    expect(d.getDate()).toBe(15);
  });

  it('handles date-only string', () => {
    const d = parseDateSafe('2026-01-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getDate()).toBe(5);
  });
});
