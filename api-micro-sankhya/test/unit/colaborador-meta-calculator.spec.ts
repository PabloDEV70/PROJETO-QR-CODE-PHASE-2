import {
  calcularMeta,
  calcularJornada,
  CargaDiaMeta,
} from '../../src/domain/services/colaborador-meta-calculator';

function mkCarga(overrides?: Partial<CargaDiaMeta>): CargaDiaMeta {
  return {
    minutosPrevistos: 480,
    intervaloAlmocoMin: 60,
    jornadaInicio: '08:00',
    jornadaFim: '17:00',
    ...overrides,
  };
}

function mkResumo(overrides?: Record<string, number>) {
  return {
    totalMinutos: 500,
    minutosProdu: 420,
    minutosOutros: 30,
    minutosAlmoco: 60,
    minutosBanheiro: 10,
    percentProdutivo: 84,
    ...overrides,
  };
}

describe('calcularMeta', () => {
  it('should calculate basic meta with defaults', () => {
    const result = calcularMeta(mkResumo(), mkCarga());
    expect(result.cargaHorariaPrevistaMin).toBe(480);
    expect(result.intervaloAlmocoProgramadoMin).toBe(60);
    expect(result.metaEfetivaMin).toBe(470); // 480 - 10 (banheiro tol)
  });

  it('should cap almoco deduction at teto (intervalo + tolerancia)', () => {
    // almoco real = 80, teto = 60 + 10 = 70 → deducted = 70
    const result = calcularMeta(mkResumo({ minutosAlmoco: 80 }), mkCarga());
    expect(result.almocoDescontadoMin).toBe(70);
    expect(result.almocoExcessoMin).toBe(10);
  });

  it('should forgive almoco within tolerance', () => {
    // almoco real = 65, teto = 70 → deducted = 65, excess = 0
    const result = calcularMeta(mkResumo({ minutosAlmoco: 65 }), mkCarga());
    expect(result.almocoDescontadoMin).toBe(65);
    expect(result.almocoExcessoMin).toBe(0);
  });

  it('should cap banheiro at tolerance', () => {
    // banheiro = 20, tolerance = 10 → deducted = 10
    const result = calcularMeta(mkResumo({ minutosBanheiro: 20 }), mkCarga());
    expect(result.banheiroDescontadoMin).toBe(10);
  });

  it('should calculate hora extra correctly', () => {
    // totalMinutos=560, almoco=60 → tempoNoTrabalho=500
    // minutosPrevistos=480 → horaExtra = 500-480 = 20
    const result = calcularMeta(
      mkResumo({ totalMinutos: 560, minutosAlmoco: 60 }),
      mkCarga(),
    );
    expect(result.horaExtraMin).toBe(20);
  });

  it('should return 0 hora extra when under previstos', () => {
    // totalMinutos=400, almoco=60 → tempoNoTrabalho=340 < 480
    const result = calcularMeta(
      mkResumo({ totalMinutos: 400, minutosAlmoco: 60 }),
      mkCarga(),
    );
    expect(result.horaExtraMin).toBe(0);
  });

  it('should handle zero minutosPrevistos gracefully', () => {
    const result = calcularMeta(mkResumo(), mkCarga({ minutosPrevistos: 0 }));
    expect(result.metaEfetivaMin).toBe(0);
    expect(result.horaExtraMin).toBe(0);
    expect(result.desempenhoPercent).toBe(0);
  });

  it('should use custom tolerancias when provided', () => {
    const result = calcularMeta(mkResumo(), mkCarga(), {
      toleranciaAlmocoExtraMin: 20,
      toleranciaBanheiroMin: 15,
    });
    expect(result.toleranciaAlmocoExtraMin).toBe(20);
    expect(result.toleranciaBanheiroMin).toBe(15);
    expect(result.metaEfetivaMin).toBe(465); // 480 - 15
  });

  it('should use floor for desempenhoPercent', () => {
    // 479 / 470 = 101.9% → floor → 101
    const result = calcularMeta(
      mkResumo({ minutosProdu: 479 }),
      mkCarga(),
    );
    expect(result.desempenhoPercent).toBe(Math.floor((479 / 470) * 100));
  });
});

describe('calcularJornada', () => {
  const carga = mkCarga();

  it('should return null for empty atividades', () => {
    expect(calcularJornada([], carga)).toBeNull();
  });

  it('should return null if jornadaInicio is empty', () => {
    const atividades = [{ hrini: '08:00', hrfim: '17:00' }];
    expect(calcularJornada(atividades, mkCarga({ jornadaInicio: '' }))).toBeNull();
  });

  it('should detect no delay when on time', () => {
    const atividades = [
      { hrini: '08:00', hrfim: '12:00' },
      { hrini: '13:00', hrfim: '17:00' },
    ];
    const result = calcularJornada(atividades, carga)!;
    expect(result.atrasoMin).toBe(0);
    expect(result.saidaAntecipadaMin).toBe(0);
    expect(result.cumpriuJornada).toBe(true);
  });

  it('should detect atraso (late start)', () => {
    const atividades = [{ hrini: '08:30', hrfim: '17:00' }];
    const result = calcularJornada(atividades, carga)!;
    expect(result.atrasoMin).toBe(30);
    expect(result.cumpriuJornada).toBe(false);
  });

  it('should detect saida antecipada (early leave)', () => {
    const atividades = [{ hrini: '08:00', hrfim: '16:00' }];
    const result = calcularJornada(atividades, carga)!;
    expect(result.saidaAntecipadaMin).toBe(60);
    expect(result.cumpriuJornada).toBe(false);
  });

  it('should sort atividades to find first/last', () => {
    const atividades = [
      { hrini: '13:00', hrfim: '17:00' },
      { hrini: '08:00', hrfim: '12:00' },
    ];
    const result = calcularJornada(atividades, carga)!;
    expect(result.primeiraAtividade).toBe('08:00');
    expect(result.ultimaAtividade).toBe('17:00');
  });
});
