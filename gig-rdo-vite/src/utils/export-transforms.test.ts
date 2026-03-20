import { describe, it, expect } from 'vitest';
import { txDate, txBool, txNum2, txDash } from './export-transforms';

describe('txDate', () => {
  it('formats ISO date string to dd/mm/yyyy', () => {
    expect(txDate('2026-02-15T10:30:00')).toBe('15/02/2026');
  });

  it('formats date-only string to dd/mm/yyyy', () => {
    expect(txDate('2026-01-05')).toBe('05/01/2026');
  });

  it('returns empty string for null', () => {
    expect(txDate(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(txDate(undefined)).toBe('');
  });

  it('returns original string if too short', () => {
    expect(txDate('2026')).toBe('2026');
  });
});

describe('txBool', () => {
  it('returns Sim for true', () => {
    expect(txBool(true)).toBe('Sim');
  });

  it('returns Nao for false', () => {
    expect(txBool(false)).toBe('Nao');
  });

  it('returns Sim for string "Sim"', () => {
    expect(txBool('Sim')).toBe('Sim');
  });

  it('returns Nao for string "Nao"', () => {
    expect(txBool('Nao')).toBe('Nao');
  });

  it('returns empty string for null', () => {
    expect(txBool(null)).toBe('');
  });

  it('stringifies other values', () => {
    expect(txBool('other')).toBe('other');
  });
});

describe('txNum2', () => {
  it('formats number with 2 decimal places using comma', () => {
    expect(txNum2(10.5)).toBe('10,50');
  });

  it('formats integer with 2 decimal places', () => {
    expect(txNum2(42)).toBe('42,00');
  });

  it('returns empty string for null', () => {
    expect(txNum2(null)).toBe('');
  });

  it('returns original string for non-numeric value', () => {
    expect(txNum2('abc')).toBe('abc');
  });

  it('formats string number correctly', () => {
    expect(txNum2('3.14')).toBe('3,14');
  });
});

describe('txDash', () => {
  it('returns dash for null', () => {
    expect(txDash(null)).toBe('-');
  });

  it('returns dash for undefined', () => {
    expect(txDash(undefined)).toBe('-');
  });

  it('returns dash for empty string', () => {
    expect(txDash('')).toBe('-');
  });

  it('returns stringified value for non-empty', () => {
    expect(txDash('hello')).toBe('hello');
    expect(txDash(42)).toBe('42');
  });
});
