import { describe, it, expect } from 'vitest';
import {
  getOsStatusLabel,
  getOsStatusColor,
  getOsManutencaoLabel,
  getOsStatusGigLabel,
  isOsBlocking,
} from './os-utils';

describe('getOsStatusLabel', () => {
  it('returns Aberta for A', () => {
    expect(getOsStatusLabel('A')).toBe('Aberta');
  });

  it('returns Em Execucao for E', () => {
    expect(getOsStatusLabel('E')).toBe('Em Execucao');
  });

  it('returns dash for null', () => {
    expect(getOsStatusLabel(null)).toBe('-');
  });

  it('returns raw status for unknown code', () => {
    expect(getOsStatusLabel('Z')).toBe('Z');
  });
});

describe('getOsStatusColor', () => {
  it('returns color for known status', () => {
    expect(getOsStatusColor('A')).toBe('#ed6c02');
  });

  it('returns default gray for null', () => {
    expect(getOsStatusColor(null)).toBe('#757575');
  });

  it('returns default gray for unknown', () => {
    expect(getOsStatusColor('Z')).toBe('#757575');
  });
});

describe('getOsManutencaoLabel', () => {
  it('returns Preventiva for P', () => {
    expect(getOsManutencaoLabel('P')).toBe('Preventiva');
  });

  it('returns Corretiva for C', () => {
    expect(getOsManutencaoLabel('C')).toBe('Corretiva');
  });

  it('returns dash for null', () => {
    expect(getOsManutencaoLabel(null)).toBe('-');
  });

  it('returns raw value for unknown', () => {
    expect(getOsManutencaoLabel('X')).toBe('X');
  });
});

describe('getOsStatusGigLabel', () => {
  it('returns label for known code', () => {
    expect(getOsStatusGigLabel('AI')).toBe('Aguardando Pecas (Impeditivo)');
  });

  it('returns null for null', () => {
    expect(getOsStatusGigLabel(null)).toBeNull();
  });

  it('returns raw code for unknown', () => {
    expect(getOsStatusGigLabel('ZZ')).toBe('ZZ');
  });
});

describe('isOsBlocking', () => {
  it('returns true for blocking status', () => {
    expect(isOsBlocking('AI')).toBe(true);
    expect(isOsBlocking('MA')).toBe(true);
  });

  it('returns false for non-blocking status', () => {
    expect(isOsBlocking('AN')).toBe(false);
    expect(isOsBlocking('SN')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isOsBlocking(null)).toBe(false);
  });

  it('returns false for unknown', () => {
    expect(isOsBlocking('ZZ')).toBe(false);
  });
});
