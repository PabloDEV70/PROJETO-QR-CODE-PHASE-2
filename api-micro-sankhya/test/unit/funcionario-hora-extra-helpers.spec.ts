import {
  agruparPorDia,
  buildMeta,
  ApontamentoRow,
  CargaDiaRow,
} from '../../src/domain/services/funcionario-hora-extra.helpers';

type CargaMap = Map<number, { minutos: number; folga: boolean }>;

function mkCargaMap(entries: [number, number, boolean][]): CargaMap {
  const map: CargaMap = new Map();
  for (const [diasem, min, folga] of entries) {
    map.set(diasem, { minutos: min, folga });
  }
  return map;
}

function mkApontamento(overrides?: Partial<ApontamentoRow>): ApontamentoRow {
  return {
    dtref: '2026-01-05',
    diasem: 2,
    item: 1,
    hrini: 800,
    hrfim: 1200,
    duracaoMinutos: 240,
    rdomotivocod: 1,
    motivoDescricao: 'ATVP',
    motivoSigla: 'ATVP',
    nuos: null,
    obs: null,
    ...overrides,
  };
}

describe('agruparPorDia', () => {
  const carga = mkCargaMap([
    [2, 480, false],  // Mon, 8h
    [1, 0, true],     // Sun, folga
  ]);

  it('should group items by date', () => {
    const rows = [
      mkApontamento({ dtref: '2026-01-05', diasem: 2, item: 1, duracaoMinutos: 240 }),
      mkApontamento({ dtref: '2026-01-05', diasem: 2, item: 2, duracaoMinutos: 240 }),
      mkApontamento({ dtref: '2026-01-06', diasem: 3, item: 1, duracaoMinutos: 300 }),
    ];
    const result = agruparPorDia(rows, carga);
    expect(result).toHaveLength(2);
    const dia5 = result.find((d) => d.dtref === '2026-01-05')!;
    expect(dia5.itens).toHaveLength(2);
    expect(dia5.minutosApontados).toBe(480);
  });

  it('should calculate hora extra when exceeding previstos', () => {
    const rows = [
      mkApontamento({ dtref: '2026-01-05', diasem: 2, duracaoMinutos: 540 }),
    ];
    const result = agruparPorDia(rows, carga);
    expect(result[0].minutosHoraExtra).toBe(60); // 540 - 480
  });

  it('should return 0 hora extra when under previstos', () => {
    const rows = [
      mkApontamento({ dtref: '2026-01-05', diasem: 2, duracaoMinutos: 400 }),
    ];
    const result = agruparPorDia(rows, carga);
    expect(result[0].minutosHoraExtra).toBe(0);
  });

  it('should treat folga as 100% hora extra', () => {
    const rows = [
      mkApontamento({ dtref: '2026-01-04', diasem: 1, duracaoMinutos: 300 }),
    ];
    const result = agruparPorDia(rows, carga);
    expect(result[0].folga).toBe(true);
    expect(result[0].minutosHoraExtra).toBe(300); // all minutes are extra
  });

  it('should handle empty rows', () => {
    const result = agruparPorDia([], carga);
    expect(result).toHaveLength(0);
  });

  it('should calculate percentualJornada correctly', () => {
    const rows = [
      mkApontamento({ dtref: '2026-01-05', diasem: 2, duracaoMinutos: 480 }),
    ];
    const result = agruparPorDia(rows, carga);
    expect(result[0].percentualJornada).toBe(100);
  });
});

describe('buildMeta', () => {
  it('should aggregate dia summaries', () => {
    const dias = [
      {
        dtref: '2026-01-05', diasem: 2, diasemLabel: 'Seg',
        minutosPrevistos: 480, minutosApontados: 540,
        minutosHoraExtra: 60, horasHoraExtraFmt: '1:00',
        folga: false, percentualJornada: 112.5,
        itens: [],
      },
      {
        dtref: '2026-01-06', diasem: 3, diasemLabel: 'Ter',
        minutosPrevistos: 480, minutosApontados: 400,
        minutosHoraExtra: 0, horasHoraExtraFmt: '0:00',
        folga: false, percentualJornada: 83.33,
        itens: [],
      },
    ];
    const meta = buildMeta(dias);
    expect(meta.totalDias).toBe(2);
    expect(meta.totalMinutosPrevistos).toBe(960);
    expect(meta.totalMinutosApontados).toBe(940);
    expect(meta.totalMinutosHoraExtra).toBe(60);
    expect(meta.diasComHoraExtra).toBe(1);
    expect(meta.mediaMinutosDia).toBe(470);
  });

  it('should return zeros for empty dias', () => {
    const meta = buildMeta([]);
    expect(meta.totalDias).toBe(0);
    expect(meta.mediaMinutosDia).toBe(0);
  });

  it('should count diasEmFolga', () => {
    const dias = [
      {
        dtref: '2026-01-04', diasem: 1, diasemLabel: 'Dom',
        minutosPrevistos: 0, minutosApontados: 300,
        minutosHoraExtra: 300, horasHoraExtraFmt: '5:00',
        folga: true, percentualJornada: 0,
        itens: [],
      },
    ];
    const meta = buildMeta(dias);
    expect(meta.diasEmFolga).toBe(1);
    expect(meta.diasComHoraExtra).toBe(1);
  });
});
