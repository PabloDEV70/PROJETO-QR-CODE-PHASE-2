import { describe, it, expect } from 'vitest';
import { isProdutivo, calcJornada } from '../jornada-utils';
import type { RdoDetalheItem } from '@/types/rdo-types';

function makeDetalhe(overrides: Partial<RdoDetalheItem> = {}): RdoDetalheItem {
  return {
    CODDETALHE: 1,
    CODRDO: 1,
    HRINI: 800,
    HRFIM: 900,
    CODMOTIVO: 1,
    motivoDescricao: 'Atividade',
    motivoSigla: 'ATVP',
    motivoProdutivo: null,
    motivoCategoria: null,
    duracaoMinutos: 60,
    ...overrides,
  } as RdoDetalheItem;
}

describe('isProdutivo', () => {
  it('returns true when motivoProdutivo is S', () => {
    expect(isProdutivo(makeDetalhe({ motivoProdutivo: 'S' }))).toBe(true);
  });

  it('returns false when motivoProdutivo is N', () => {
    expect(isProdutivo(makeDetalhe({ motivoProdutivo: 'N' }))).toBe(false);
  });

  it('falls back to sigla ATVP when motivoProdutivo is null', () => {
    expect(isProdutivo(makeDetalhe({ motivoProdutivo: null, motivoSigla: 'ATVP' }))).toBe(true);
  });

  it('falls back to sigla EXEC when motivoProdutivo is null', () => {
    expect(isProdutivo(makeDetalhe({ motivoProdutivo: null, motivoSigla: 'EXEC' }))).toBe(true);
  });

  it('returns false for non-productive sigla without backend flag', () => {
    expect(isProdutivo(makeDetalhe({ motivoProdutivo: null, motivoSigla: 'ALMOCO' }))).toBe(false);
  });

  it('falls back to description containing PRODUTIV', () => {
    expect(isProdutivo(makeDetalhe({
      motivoProdutivo: null,
      motivoSigla: 'XPTO',
      motivoDescricao: 'Atividade Produtiva',
    }))).toBe(true);
  });
});

describe('calcJornada', () => {
  it('returns zero for empty array', () => {
    const result = calcJornada([]);
    expect(result.totalMin).toBe(0);
    expect(result.prodMin).toBe(0);
    expect(result.pctProdutivo).toBe(0);
    expect(result.categorias).toHaveLength(0);
  });

  it('calculates total and productive minutes', () => {
    const detalhes = [
      makeDetalhe({ motivoProdutivo: 'S', duracaoMinutos: 120, motivoSigla: 'ATVP' }),
      makeDetalhe({ motivoProdutivo: 'N', duracaoMinutos: 60, motivoSigla: 'ALMOCO', motivoDescricao: 'Almoco' }),
    ];
    const result = calcJornada(detalhes);
    expect(result.totalMin).toBe(180);
    expect(result.prodMin).toBe(120);
    expect(result.naoProdMin).toBe(60);
    expect(result.pctProdutivo).toBe(67);
  });

  it('groups by sigla', () => {
    const detalhes = [
      makeDetalhe({ motivoProdutivo: 'S', duracaoMinutos: 60, motivoSigla: 'ATVP' }),
      makeDetalhe({ motivoProdutivo: 'S', duracaoMinutos: 30, motivoSigla: 'ATVP' }),
    ];
    const result = calcJornada(detalhes);
    expect(result.categorias).toHaveLength(1);
    expect(result.categorias[0].minutos).toBe(90);
    expect(result.categorias[0].count).toBe(2);
  });

  it('uses HRINI/HRFIM fallback when duracaoMinutos is null', () => {
    const detalhes = [
      makeDetalhe({ motivoProdutivo: 'S', duracaoMinutos: undefined as unknown as number, HRINI: 800, HRFIM: 1000 }),
    ];
    const result = calcJornada(detalhes);
    expect(result.totalMin).toBe(120);
  });
});
