import {
  ColaboradorJornadaInfo,
} from '../../types/AD_RDOAPONTAMENTOS';

export { calcularResumoPeriodo } from './colaborador-resumo-periodo';

export interface CargaDiaMeta {
  minutosPrevistos: number;
  intervaloAlmocoMin: number;
  jornadaInicio: string;
  jornadaFim: string;
}

export interface MetaTolerancias {
  toleranciaAlmocoExtraMin: number;
  toleranciaBanheiroMin: number;
}

interface ResumoDia {
  totalMinutos: number;
  minutosProdu: number;
  minutosOutros: number;
  minutosAlmoco: number;
  minutosBanheiro: number;
  motivoMinutos?: Record<number, number>;
  percentProdutivo: number;
}

/**
 * New lunch tolerance formula:
 * - If actual < scheduled: deduct full scheduled (mandatory break)
 * - If actual within scheduled+10: deduct actual (forgiven)
 * - If actual > scheduled+10: deduct scheduled+10 (excess penalizes)
 *
 * almocoDescontado = min(max(actual, scheduled), scheduled + 10)
 */
export function calcularMeta(
  resumo: ResumoDia,
  cargaDia: CargaDiaMeta,
  tolerancias?: MetaTolerancias,
) {
  const { minutosPrevistos, intervaloAlmocoMin } = cargaDia;
  const toleranciaExtra = tolerancias?.toleranciaAlmocoExtraMin ?? 10;
  const toleranciaBanheiroMin = tolerancias?.toleranciaBanheiroMin ?? 10;

  const almocoReal = resumo.minutosAlmoco;
  const teto = intervaloAlmocoMin + toleranciaExtra;
  const almocoDescontado = Math.min(almocoReal, teto);
  const almocoExcesso = Math.max(almocoReal - teto, 0);

  const banheiroReal = resumo.minutosBanheiro;
  const banheiroDescontado = Math.min(banheiroReal, toleranciaBanheiroMin);

  // Meta efetiva = carga de trabalho - tolerancia banheiro (SEMPRE descontada)
  const metaEfetivaMin = Math.max(minutosPrevistos - toleranciaBanheiroMin, 0);

  // Contabilizado = total bruto - almoco descontado - banheiro descontado
  const minutosContabilizados = resumo.totalMinutos - almocoDescontado - banheiroDescontado;

  // Tempo fisico no trabalho (so desconta almoco, banheiro NAO influencia HEX)
  const tempoNoTrabalho = resumo.totalMinutos - almocoDescontado;

  // Hora extra: banheiro NAO entra -- pessoa estava no trabalho
  const horaExtraMin = minutosPrevistos > 0
    ? Math.max(tempoNoTrabalho - minutosPrevistos, 0) : 0;

  // Productive metrics (ATVP-based)
  const minutosProdu = resumo.minutosProdu;
  const metaProdutivaMin = metaEfetivaMin;
  const gapNaoProdutivoMin = Math.max(minutosContabilizados - minutosProdu, 0);
  const aproveitamentoPercent = minutosContabilizados > 0
    ? Math.round((minutosProdu / minutosContabilizados) * 100)
    : 0;
  // Floor so 479/480 = 99%, not 100%. Only 100% when truly >= meta.
  const desempenhoPercent = metaProdutivaMin > 0
    ? Math.floor((minutosProdu / metaProdutivaMin) * 100)
    : 0;
  const atingiuMetaProdutiva = minutosProdu >= metaProdutivaMin;

  // Repurpose: meta/saldo now based on productive minutes
  const atingiuMeta = atingiuMetaProdutiva;
  const percentMeta = desempenhoPercent;
  const saldoMin = minutosProdu - metaProdutivaMin;

  return {
    cargaHorariaPrevistaMin: minutosPrevistos,
    intervaloAlmocoProgramadoMin: intervaloAlmocoMin,
    toleranciaAlmocoExtraMin: toleranciaExtra,
    toleranciaBanheiroMin,
    almocoRealMin: almocoReal,
    almocoDescontadoMin: almocoDescontado,
    almocoExcessoMin: almocoExcesso,
    banheiroRealMin: banheiroReal,
    banheiroDescontadoMin: banheiroDescontado,
    metaEfetivaMin,
    minutosContabilizados,
    atingiuMeta,
    percentMeta,
    saldoMin,
    horaExtraMin,
    metaProdutivaMin,
    aproveitamentoPercent,
    desempenhoPercent,
    atingiuMetaProdutiva,
    gapNaoProdutivoMin,
  };
}

/** Converte "HH:MM" para minutos desde meia-noite */
function horaParaMinutos(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  return h * 60 + m;
}

/**
 * Compara primeira/ultima atividade com horario previsto da jornada.
 * Retorna null se sem atividades ou sem jornada info.
 */
export function calcularJornada(
  atividades: { hrini: string; hrfim: string }[],
  cargaDia: CargaDiaMeta,
): ColaboradorJornadaInfo | null {
  if (!atividades.length || !cargaDia.jornadaInicio || !cargaDia.jornadaFim) {
    return null;
  }

  const sorted = [...atividades].sort(
    (a, b) => horaParaMinutos(a.hrini) - horaParaMinutos(b.hrini),
  );

  const primeiraAtividade = sorted[0]?.hrini ?? cargaDia.jornadaInicio;
  const ultimaAtividade = sorted[sorted.length - 1]?.hrfim ?? cargaDia.jornadaFim;

  const prevIni = horaParaMinutos(cargaDia.jornadaInicio);
  const prevFim = horaParaMinutos(cargaDia.jornadaFim);
  const realIni = horaParaMinutos(primeiraAtividade);
  const realFim = horaParaMinutos(ultimaAtividade);

  const atrasoMin = Math.max(realIni - prevIni, 0);
  const saidaAntecipadaMin = Math.max(prevFim - realFim, 0);
  const cumpriuJornada = atrasoMin === 0 && saidaAntecipadaMin === 0;

  return {
    jornadaIniPrevisto: cargaDia.jornadaInicio,
    jornadaFimPrevisto: cargaDia.jornadaFim,
    primeiraAtividade,
    ultimaAtividade,
    atrasoMin,
    saidaAntecipadaMin,
    cumpriuJornada,
  };
}
