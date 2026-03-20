import { describe, it, expect } from 'vitest';
import { fmtBr, aggregateBreakdowns } from './wt-dia-helpers';

describe('fmtBr', () => {
  it('converts yyyy-mm-dd to dd/mm/yyyy', () => {
    expect(fmtBr('2026-02-15')).toBe('15/02/2026');
  });

  it('handles ISO datetime strings', () => {
    expect(fmtBr('2026-01-05T10:30:00')).toBe('05/01/2026');
  });

  it('returns short strings unchanged', () => {
    expect(fmtBr('2026')).toBe('2026');
    expect(fmtBr('')).toBe('');
  });
});

describe('aggregateBreakdowns', () => {
  it('returns empty array for no colabs', () => {
    expect(aggregateBreakdowns([])).toEqual([]);
  });

  it('aggregates single collaborator breakdowns', () => {
    const colabs = [{
      categoryBreakdown: [
        {
          category: 'wrenchTime',
          label: 'Produtivo',
          color: '#2e7d32',
          tips: 'tip1',
          totalMin: 120,
          motivos: [
            { cod: 1, sigla: 'ATVP', descricao: 'Atividade Produtiva', totalMin: 120 },
          ],
        },
      ],
    }];
    const result = aggregateBreakdowns(colabs);
    expect(result).toHaveLength(1);
    expect(result[0]!.category).toBe('wrenchTime');
    expect(result[0]!.totalMin).toBe(120);
    expect(result[0]!.percentOfTotal).toBe(100);
    expect(result[0]!.motivos[0]!.percentOfCategory).toBe(100);
  });

  it('merges same category across collaborators', () => {
    const colabs = [
      {
        categoryBreakdown: [{
          category: 'wrenchTime', label: 'Produtivo', color: '#2e7d32', tips: 'tip',
          totalMin: 60,
          motivos: [{ cod: 1, sigla: 'ATVP', descricao: 'Prod', totalMin: 60 }],
        }],
      },
      {
        categoryBreakdown: [{
          category: 'wrenchTime', label: 'Produtivo', color: '#2e7d32', tips: 'tip',
          totalMin: 40,
          motivos: [{ cod: 1, sigla: 'ATVP', descricao: 'Prod', totalMin: 40 }],
        }],
      },
    ];
    const result = aggregateBreakdowns(colabs);
    expect(result).toHaveLength(1);
    expect(result[0]!.totalMin).toBe(100);
    expect(result[0]!.motivos[0]!.totalMin).toBe(100);
  });

  it('sorts wrenchTime first, then by totalMin desc', () => {
    const colabs = [{
      categoryBreakdown: [
        {
          category: 'loss', label: 'Perda', color: '#f00', tips: '',
          totalMin: 200,
          motivos: [],
        },
        {
          category: 'wrenchTime', label: 'Produtivo', color: '#0f0', tips: '',
          totalMin: 100,
          motivos: [],
        },
      ],
    }];
    const result = aggregateBreakdowns(colabs);
    expect(result[0]!.category).toBe('wrenchTime');
    expect(result[1]!.category).toBe('loss');
  });

  it('computes percentOfTotal across categories', () => {
    const colabs = [{
      categoryBreakdown: [
        {
          category: 'wrenchTime', label: 'Prod', color: '#0f0', tips: '',
          totalMin: 75,
          motivos: [],
        },
        {
          category: 'loss', label: 'Perda', color: '#f00', tips: '',
          totalMin: 25,
          motivos: [],
        },
      ],
    }];
    const result = aggregateBreakdowns(colabs);
    expect(result[0]!.percentOfTotal).toBe(75);
    expect(result[1]!.percentOfTotal).toBe(25);
  });
});
