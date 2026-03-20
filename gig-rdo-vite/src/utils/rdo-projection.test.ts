import { describe, it, expect } from 'vitest';
import { computeProjection } from './rdo-projection';

describe('computeProjection', () => {
  it('returns null when mediaHorasProdDia is 0', () => {
    expect(computeProjection({
      mediaHorasProdDia: 0,
      dataFim: '2026-02-15',
      metaMensalHoras: 160,
    })).toBeNull();
  });

  it('returns null when metaMensalHoras is 0', () => {
    expect(computeProjection({
      mediaHorasProdDia: 5,
      dataFim: '2026-02-15',
      metaMensalHoras: 0,
    })).toBeNull();
  });

  it('returns null when dataFim is undefined', () => {
    expect(computeProjection({
      mediaHorasProdDia: 5,
      metaMensalHoras: 160,
    })).toBeNull();
  });

  it('computes projection for mid-month date', () => {
    const result = computeProjection({
      mediaHorasProdDia: 5,
      dataFim: '2026-02-15',
      metaMensalHoras: 160,
    });
    expect(result).not.toBeNull();
    // Feb 2026 has 28 days
    expect(result!.diasRestantes).toBe(13); // 28 - 15
    expect(result!.projecaoHoras).toBe(140); // 5 * 28
    expect(result!.statusPercent).toBe(88); // round(140/160*100)
    expect(result!.horasNecessariasDia).toBeGreaterThan(0);
  });

  it('returns 0 diasRestantes on last day of month', () => {
    const result = computeProjection({
      mediaHorasProdDia: 6,
      dataFim: '2026-02-28',
      metaMensalHoras: 160,
    });
    expect(result).not.toBeNull();
    expect(result!.diasRestantes).toBe(0);
    expect(result!.horasNecessariasDia).toBe(0);
  });
});
