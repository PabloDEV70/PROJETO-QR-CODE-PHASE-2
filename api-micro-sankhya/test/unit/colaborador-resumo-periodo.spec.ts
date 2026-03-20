import { calcularResumoPeriodo } from '../../src/domain/services/colaborador-resumo-periodo';
import type { ColaboradorTimelineDia } from '../../src/types/AD_RDOAPONTAMENTOS';

function mkDia(overrides?: Partial<{
  totalMinutos: number;
  minutosProdu: number;
  minutosOutros: number;
  minutosAlmoco: number;
  minutosBanheiro: number;
  percentMeta: number;
  atingiuMeta: boolean;
  atingiuMetaProdutiva: boolean;
  horaExtraMin: number;
  saldoMin: number;
  metaProdutivaMin: number;
  gapNaoProdutivoMin: number;
  cargaHorariaPrevistaMin: number;
  metaEfetivaMin: number;
  minutosContabilizados: number;
  cumpriuJornada: boolean | null;
  atrasoMin: number;
  saidaAntecipadaMin: number;
}>): ColaboradorTimelineDia {
  const o = overrides ?? {};
  return {
    data: '2026-01-05',
    diaSemana: 2,
    diaSemanaLabel: 'Seg',
    atividades: [],
    resumo: {
      totalMinutos: o.totalMinutos ?? 500,
      minutosProdu: o.minutosProdu ?? 400,
      minutosOutros: o.minutosOutros ?? 50,
      minutosAlmoco: o.minutosAlmoco ?? 60,
      minutosBanheiro: o.minutosBanheiro ?? 10,
      motivoMinutos: {},
      percentProdutivo: 80,
    },
    meta: {
      cargaHorariaPrevistaMin: o.cargaHorariaPrevistaMin ?? 480,
      intervaloAlmocoProgramadoMin: 60,
      toleranciaAlmocoExtraMin: 10,
      toleranciaBanheiroMin: 10,
      almocoRealMin: 60,
      almocoDescontadoMin: 60,
      almocoExcessoMin: 0,
      banheiroRealMin: 10,
      banheiroDescontadoMin: 10,
      metaEfetivaMin: o.metaEfetivaMin ?? 470,
      minutosContabilizados: o.minutosContabilizados ?? 430,
      atingiuMeta: o.atingiuMeta ?? true,
      percentMeta: o.percentMeta ?? 95,
      saldoMin: o.saldoMin ?? 10,
      horaExtraMin: o.horaExtraMin ?? 0,
      metaProdutivaMin: o.metaProdutivaMin ?? 470,
      aproveitamentoPercent: 93,
      desempenhoPercent: 85,
      atingiuMetaProdutiva: o.atingiuMetaProdutiva ?? true,
      gapNaoProdutivoMin: o.gapNaoProdutivoMin ?? 30,
    },
    jornada: o.cumpriuJornada !== undefined ? {
      jornadaIniPrevisto: '08:00',
      jornadaFimPrevisto: '17:00',
      primeiraAtividade: '08:00',
      ultimaAtividade: '17:00',
      atrasoMin: o.atrasoMin ?? 0,
      saidaAntecipadaMin: o.saidaAntecipadaMin ?? 0,
      cumpriuJornada: o.cumpriuJornada ?? true,
    } : null,
  };
}

describe('calcularResumoPeriodo', () => {
  it('should return zeros for empty array', () => {
    const result = calcularResumoPeriodo([]);
    expect(result.totalMinutosTrabalhados).toBe(0);
    expect(result.totalMinutosProdutivos).toBe(0);
    expect(result.percentProdutivoGeral).toBe(0);
    expect(result.mediaDiariaMinutos).toBe(0);
  });

  it('should aggregate totals from multiple dias', () => {
    const dias = [mkDia(), mkDia({ totalMinutos: 520, minutosProdu: 450 })];
    const result = calcularResumoPeriodo(dias);
    expect(result.totalMinutosTrabalhados).toBe(1020);
    expect(result.totalMinutosProdutivos).toBe(850);
  });

  it('should count dias that atingiuMeta', () => {
    const dias = [
      mkDia({ atingiuMeta: true }),
      mkDia({ atingiuMeta: false }),
      mkDia({ atingiuMeta: true }),
    ];
    const result = calcularResumoPeriodo(dias);
    expect(result.diasAtingiuMeta).toBe(2);
    expect(result.diasNaoAtingiuMeta).toBe(1);
    expect(result.percentDiasComMeta).toBe(67); // round(2/3 * 100)
  });

  it('should track hora extra and deficit', () => {
    const dias = [
      mkDia({ horaExtraMin: 30, saldoMin: 30 }),
      mkDia({ horaExtraMin: 0, saldoMin: -20 }),
    ];
    const result = calcularResumoPeriodo(dias);
    expect(result.totalHoraExtraMin).toBe(30);
    expect(result.diasComHoraExtra).toBe(1);
    expect(result.totalDeficitMin).toBe(20);
    expect(result.diasComDeficit).toBe(1);
  });

  it('should track jornada compliance', () => {
    const dias = [
      mkDia({ cumpriuJornada: true, atrasoMin: 0, saidaAntecipadaMin: 0 }),
      mkDia({ cumpriuJornada: false, atrasoMin: 15, saidaAntecipadaMin: 30 }),
    ];
    const result = calcularResumoPeriodo(dias);
    expect(result.diasCumpriuJornada).toBe(1);
    expect(result.diasNaoCumpriuJornada).toBe(1);
    expect(result.totalAtrasoMin).toBe(15);
    expect(result.totalSaidaAntecipadaMin).toBe(30);
  });

  it('should handle null jornada', () => {
    const dias = [mkDia()]; // jornada is null by default
    const result = calcularResumoPeriodo(dias);
    expect(result.diasCumpriuJornada).toBe(0);
    expect(result.diasNaoCumpriuJornada).toBe(0);
  });

  it('should calculate aproveitamento and desempenho geral', () => {
    const dias = [
      mkDia({ minutosProdu: 400, minutosContabilizados: 430, metaProdutivaMin: 470 }),
    ];
    const result = calcularResumoPeriodo(dias);
    expect(result.aproveitamentoGeralPercent).toBe(Math.round(400 / 430 * 100));
    expect(result.desempenhoGeralPercent).toBe(Math.round(400 / 470 * 100));
  });
});
