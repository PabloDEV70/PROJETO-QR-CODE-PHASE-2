import {
  buildScheduleLookup,
  buildExcludedDates,
  calcFuncionarioHoras,
  buildResumo,
} from '../../src/domain/services/horas-esperadas-calc';
import type {
  FuncionarioAtivoRaw,
  HorarioSemanalRaw,
  AusenciaRaw,
  HorasEsperadasFuncionario,
} from '../../src/types/HORAS_ESPERADAS';

function makeFuncionario(overrides?: Partial<FuncionarioAtivoRaw>): FuncionarioAtivoRaw {
  return {
    CODEMP: 1, CODFUNC: 100, NOMEFUNC: 'Joao', DTADM: '2020-01-01',
    CODPARC: 3396, CODDEP: 10, CODCARGAHOR: 1,
    ...overrides,
  };
}

describe('buildScheduleLookup', () => {
  it('should build map from horario rows', () => {
    const horarios: HorarioSemanalRaw[] = [
      { CODCARGAHOR: 1, DIASEM: 2, minutosDia: 480 },
      { CODCARGAHOR: 1, DIASEM: 3, minutosDia: 480 },
      { CODCARGAHOR: 2, DIASEM: 2, minutosDia: 360 },
    ];
    const lookup = buildScheduleLookup(horarios);
    expect(lookup.size).toBe(2);
    expect(lookup.get(1)!.get(2)).toBe(480);
    expect(lookup.get(1)!.get(3)).toBe(480);
    expect(lookup.get(2)!.get(2)).toBe(360);
  });

  it('should return empty map for empty input', () => {
    const lookup = buildScheduleLookup([]);
    expect(lookup.size).toBe(0);
  });

  it('should handle NaN minutosDia as 0', () => {
    const horarios: HorarioSemanalRaw[] = [
      { CODCARGAHOR: 1, DIASEM: 2, minutosDia: NaN },
    ];
    const lookup = buildScheduleLookup(horarios);
    expect(lookup.get(1)!.get(2)).toBe(0);
  });
});

describe('buildExcludedDates', () => {
  it('should build excluded dates within period', () => {
    const ausencias: AusenciaRaw[] = [
      { CODEMP: 1, CODFUNC: 10, dtInicio: '2026-01-05', numDias: 3, tipo: 'FERIAS' },
    ];
    const map = buildExcludedDates(ausencias, '2026-01-01', '2026-01-31');
    const entry = map.get('1-10')!;
    expect(entry.dates.size).toBe(3);
    expect(entry.dates.has('2026-01-05')).toBe(true);
    expect(entry.dates.has('2026-01-06')).toBe(true);
    expect(entry.dates.has('2026-01-07')).toBe(true);
  });

  it('should clip dates outside period', () => {
    const ausencias: AusenciaRaw[] = [
      { CODEMP: 1, CODFUNC: 10, dtInicio: '2025-12-30', numDias: 5, tipo: 'FERIAS' },
    ];
    // Period: Jan 1 - Jan 31. Ausencia: Dec 30 - Jan 3 → only Jan 1, 2, 3 inside
    const map = buildExcludedDates(ausencias, '2026-01-01', '2026-01-31');
    const entry = map.get('1-10')!;
    expect(entry.dates.size).toBe(3);
    expect(entry.dates.has('2026-01-01')).toBe(true);
    expect(entry.dates.has('2025-12-30')).toBe(false);
  });

  it('should return empty map for empty ausencias', () => {
    const map = buildExcludedDates([], '2026-01-01', '2026-01-31');
    expect(map.size).toBe(0);
  });

  it('should track ausencia summaries', () => {
    const ausencias: AusenciaRaw[] = [
      { CODEMP: 1, CODFUNC: 10, dtInicio: '2026-01-05', numDias: 2, tipo: 'FERIAS' },
      { CODEMP: 1, CODFUNC: 10, dtInicio: '2026-01-15', numDias: 1, tipo: 'AFASTAMENTO' },
    ];
    const map = buildExcludedDates(ausencias, '2026-01-01', '2026-01-31');
    const entry = map.get('1-10')!;
    expect(entry.ausencias).toHaveLength(2);
    expect(entry.ausencias[0].tipo).toBe('FERIAS');
    expect(entry.ausencias[0].dias).toBe(2);
    expect(entry.ausencias[1].tipo).toBe('AFASTAMENTO');
    expect(entry.ausencias[1].dias).toBe(1);
  });
});

describe('calcFuncionarioHoras', () => {
  // Mon=2..Fri=6 → 480 min/day; Sat(7)/Sun(1) not in schedule
  const schedule = buildScheduleLookup([
    { CODCARGAHOR: 1, DIASEM: 2, minutosDia: 480 },
    { CODCARGAHOR: 1, DIASEM: 3, minutosDia: 480 },
    { CODCARGAHOR: 1, DIASEM: 4, minutosDia: 480 },
    { CODCARGAHOR: 1, DIASEM: 5, minutosDia: 480 },
    { CODCARGAHOR: 1, DIASEM: 6, minutosDia: 480 },
  ]);

  it('should count weekdays for a full work week', () => {
    // 2026-01-05 (Mon) to 2026-01-09 (Fri)
    const result = calcFuncionarioHoras(
      makeFuncionario(), schedule, new Map(), new Set(),
      '2026-01-05', '2026-01-09',
    );
    expect(result.diasUteis).toBe(5);
    expect(result.minutosEsperados).toBe(2400);
    expect(result.horasEsperadas).toBe(40);
  });

  it('should exclude holidays', () => {
    const holidays = new Set(['2026-01-06']); // Tue
    const result = calcFuncionarioHoras(
      makeFuncionario(), schedule, new Map(), holidays,
      '2026-01-05', '2026-01-09',
    );
    expect(result.diasUteis).toBe(4);
    expect(result.diasExcluidos).toBe(1);
    expect(result.minutosEsperados).toBe(1920);
  });

  it('should exclude ausencia dates', () => {
    const excMap = buildExcludedDates(
      [{ CODEMP: 1, CODFUNC: 100, dtInicio: '2026-01-07', numDias: 2, tipo: 'FERIAS' }],
      '2026-01-05', '2026-01-09',
    );
    const result = calcFuncionarioHoras(
      makeFuncionario(), schedule, excMap, new Set(),
      '2026-01-05', '2026-01-09',
    );
    expect(result.diasUteis).toBe(3);
    expect(result.diasExcluidos).toBe(2);
  });

  it('should clip start to admission date when after period start', () => {
    const f = makeFuncionario({ DTADM: '2026-01-07' }); // Wed
    const result = calcFuncionarioHoras(
      f, schedule, new Map(), new Set(),
      '2026-01-05', '2026-01-09',
    );
    // Wed-Fri = 3 days
    expect(result.diasUteis).toBe(3);
    expect(result.minutosEsperados).toBe(1440);
  });

  it('should handle no schedule (CODCARGAHOR null)', () => {
    const f = makeFuncionario({ CODCARGAHOR: null });
    const result = calcFuncionarioHoras(
      f, schedule, new Map(), new Set(),
      '2026-01-05', '2026-01-09',
    );
    expect(result.diasUteis).toBe(0);
    expect(result.minutosEsperados).toBe(0);
  });

  it('should skip weekend days not in schedule', () => {
    // 2026-01-03 (Sat) to 2026-01-04 (Sun)
    const result = calcFuncionarioHoras(
      makeFuncionario(), schedule, new Map(), new Set(),
      '2026-01-03', '2026-01-04',
    );
    expect(result.diasUteis).toBe(0);
    expect(result.minutosEsperados).toBe(0);
  });

  it('should return correct codparc and nomefunc', () => {
    const f = makeFuncionario({ CODPARC: 9999, NOMEFUNC: 'Maria' });
    const result = calcFuncionarioHoras(
      f, schedule, new Map(), new Set(),
      '2026-01-05', '2026-01-05',
    );
    expect(result.codparc).toBe(9999);
    expect(result.nomefunc).toBe('Maria');
  });

  it('should return empty ausencias when no exclusions', () => {
    const result = calcFuncionarioHoras(
      makeFuncionario(), schedule, new Map(), new Set(),
      '2026-01-05', '2026-01-05',
    );
    expect(result.ausencias).toEqual([]);
  });
});

describe('buildResumo', () => {
  it('should aggregate totals from data', () => {
    const data = [
      { codemp: 1, codfunc: 1, codparc: 100, nomefunc: 'A', coddep: 1, codcargahor: 1, dtadm: '2025-01-01', diasUteis: 20, diasExcluidos: 2, minutosEsperados: 9600, horasEsperadas: 160, ausencias: [] },
      { codemp: 1, codfunc: 2, codparc: 200, nomefunc: 'B', coddep: 1, codcargahor: 1, dtadm: '2025-01-01', diasUteis: 18, diasExcluidos: 4, minutosEsperados: 8640, horasEsperadas: 144, ausencias: [] },
    ];
    const resumo = buildResumo(data);
    expect(resumo.totalFuncionarios).toBe(2);
    expect(resumo.totalMinutosEsperados).toBe(18240);
    expect(resumo.totalDiasUteis).toBe(38);
    expect(resumo.totalDiasExcluidos).toBe(6);
  });

  it('should return zeros for empty data', () => {
    const resumo = buildResumo([]);
    expect(resumo.totalFuncionarios).toBe(0);
    expect(resumo.totalMinutosEsperados).toBe(0);
    expect(resumo.mediaHorasPorFuncionario).toBe(0);
  });

  it('should calculate media correctly', () => {
    const data = [
      { codemp: 1, codfunc: 1, codparc: 100, nomefunc: 'A', coddep: 1, codcargahor: 1, dtadm: '2025-01-01', diasUteis: 20, diasExcluidos: 0, minutosEsperados: 9600, horasEsperadas: 160, ausencias: [] },
    ];
    const resumo = buildResumo(data);
    expect(resumo.mediaHorasPorFuncionario).toBe(160);
  });
});
