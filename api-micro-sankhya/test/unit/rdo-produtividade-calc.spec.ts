import {
  calcIntervaloAlmoco,
  calcProdutividade,
  TurnoRow,
} from '../../src/domain/services/rdo-produtividade-calc';
import { MotivoConfigMap, MotivoConfigItem } from '../../src/types/AD_RDOMOTIVOS';

function mkTurno(diasem: number, turno: number, entrada: number | null, saida: number | null): TurnoRow {
  return { codcargahor: 1, diasem, turno, entrada, saida };
}

function mkConfigMap(overrides?: Record<number, Partial<MotivoConfigItem>>): MotivoConfigMap {
  const defaults: Record<number, MotivoConfigItem> = {
    1: { rdomotivocod: 1, produtivo: true, toleranciaMin: 0, penalidadeMin: 0, wtCategoria: 'produtivo' },
    2: { rdomotivocod: 2, produtivo: false, toleranciaMin: 10, penalidadeMin: 0, wtCategoria: 'banheiro' },
    3: { rdomotivocod: 3, produtivo: false, toleranciaMin: 10, penalidadeMin: 0, wtCategoria: 'almoco' },
    4: { rdomotivocod: 4, produtivo: false, toleranciaMin: 0, penalidadeMin: 5, wtCategoria: 'fumar' },
  };
  const map: MotivoConfigMap = new Map();
  for (const [k, v] of Object.entries(defaults)) {
    const cod = Number(k);
    map.set(cod, { ...v, ...overrides?.[cod] });
  }
  return map;
}

describe('calcIntervaloAlmoco', () => {
  it('should return 0 for single turno', () => {
    const turnos = [mkTurno(2, 1, 800, 1200)];
    expect(calcIntervaloAlmoco(turnos)).toBe(0);
  });

  it('should calculate gap between two turnos', () => {
    // 08:00-12:00, 13:00-17:00 → gap = 60 min
    const turnos = [
      mkTurno(2, 1, 800, 1200),
      mkTurno(2, 2, 1300, 1700),
    ];
    expect(calcIntervaloAlmoco(turnos)).toBe(60);
  });

  it('should return 0 if no gap between turnos', () => {
    // 08:00-12:00, 12:00-17:00 → gap = 0
    const turnos = [
      mkTurno(2, 1, 800, 1200),
      mkTurno(2, 2, 1200, 1700),
    ];
    expect(calcIntervaloAlmoco(turnos)).toBe(0);
  });

  it('should handle null entrada/saida gracefully', () => {
    const turnos = [
      mkTurno(2, 1, null, 1200),
      mkTurno(2, 2, 1300, 1700),
    ];
    // Only 1 valid turno → 0
    expect(calcIntervaloAlmoco(turnos)).toBe(0);
  });

  it('should return 0 for empty array', () => {
    expect(calcIntervaloAlmoco([])).toBe(0);
  });

  it('should sum gaps for 3 turnos', () => {
    // 08:00-10:00, 10:30-12:00, 13:00-17:00
    // gap1 = 30min, gap2 = 60min → total = 90
    const turnos = [
      mkTurno(2, 1, 800, 1000),
      mkTurno(2, 2, 1030, 1200),
      mkTurno(2, 3, 1300, 1700),
    ];
    expect(calcIntervaloAlmoco(turnos)).toBe(90);
  });
});

describe('calcProdutividade', () => {
  const configMap = mkConfigMap();

  it('should return zeros for empty motivos', () => {
    const result = calcProdutividade([], 480, 60, 'ESTRITO', configMap);
    expect(result.minutosProdu).toBe(0);
    expect(result.totalBrutoMin).toBe(0);
    expect(result.produtividadePercent).toBe(0);
  });

  it('should calculate ESTRITO mode (only motivo 1 is productive)', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 5, qtdRegistros: 2, totalMinutos: 80 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.minutosProdu).toBe(400);
    expect(result.totalBrutoMin).toBe(480);
  });

  it('should calculate AMPLO mode (all non-special are productive)', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 5, qtdRegistros: 2, totalMinutos: 80 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'AMPLO', configMap);
    // In AMPLO, motivo 5 (no special config) is also productive
    expect(result.minutosProdu).toBe(480);
  });

  it('should deduct almoco within tolerance', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 3, qtdRegistros: 1, totalMinutos: 65 },
    ];
    // intervaloAlmoco=60, tolerance=10 → teto=70 → deducted=65
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.almocoDescontadoMin).toBe(65);
    expect(result.almocoMin).toBe(65);
  });

  it('should cap almoco deduction at teto', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 3, qtdRegistros: 1, totalMinutos: 90 },
    ];
    // teto=70, actual=90 → deducted=70
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.almocoDescontadoMin).toBe(70);
  });

  it('should apply fumar penalidade per occurrence', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 4, qtdRegistros: 3, totalMinutos: 15 },
    ];
    // Fumar: 3 ocorrencias × 5min penalidade = 15min
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.minutosFumarPenalidade).toBe(15);
    expect(result.fumarQtd).toBe(3);
    expect(result.fumarMinReal).toBe(15);
  });

  it('should return 0 produtividadePercent when metaEfetiva is 0', () => {
    const result = calcProdutividade([], 0, 0, 'ESTRITO', configMap);
    expect(result.produtividadePercent).toBe(0);
    expect(result.metaEfetivaMin).toBe(0);
  });

  it('should calculate hora extra correctly', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 10, totalMinutos: 560 },
    ];
    // minutosPrevistos=480, totalBruto=560, almoco=0 → tempoNoTrabalho=560
    // horaExtra = max(560-480, 0) = 80
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.horaExtraMin).toBe(80);
  });

  it('should set diagnostico based on percentage', () => {
    // 470/470 = 100% → "Na meta"
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 470 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.diagnostico).toMatch(/Na meta|Excelente|Quase la/);
  });

  it('should populate motivoMinutos record correctly', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 3, totalMinutos: 200 },
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 1, totalMinutos: 50 },
      { codrdo: 1, rdomotivocod: 5, qtdRegistros: 2, totalMinutos: 100 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.motivoMinutos[1]).toBe(250);
    expect(result.motivoMinutos[5]).toBe(100);
  });

  it('should return negative saldoJornadaMin when under previstos', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 3, totalMinutos: 300 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    // tempoNoTrabalho=300, saldo=300-480=-180
    expect(result.saldoJornadaMin).toBe(-180);
    expect(result.horaExtraMin).toBe(0);
  });

  it('should not let minutosProdu go negative from fumar penalty', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 1, totalMinutos: 10 },
      { codrdo: 1, rdomotivocod: 4, qtdRegistros: 5, totalMinutos: 30 },
    ];
    // penalty = 5*5=25 > produtivo 10 → max(10-25,0) = 0
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.minutosProdu).toBe(0);
  });

  it('should handle banheiro tolerance and excess correctly', () => {
    const motivos = [
      { codrdo: 1, rdomotivocod: 1, qtdRegistros: 5, totalMinutos: 400 },
      { codrdo: 1, rdomotivocod: 2, qtdRegistros: 4, totalMinutos: 25 },
    ];
    const result = calcProdutividade(motivos, 480, 60, 'ESTRITO', configMap);
    expect(result.banheiroMin).toBe(25);
    expect(result.banheiroDescontadoMin).toBe(10);
    // excess banheiro = 25-10=15 → goes to minutosNaoProdu
    expect(result.minutosNaoProdu).toBe(15);
  });
});
