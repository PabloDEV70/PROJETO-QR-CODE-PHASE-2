import {
  ColaboradorTimelineDia,
} from '../../types/AD_RDOAPONTAMENTOS';

export function calcularResumoPeriodo(dias: ColaboradorTimelineDia[]) {
  let totalMinutosTrabalhados = 0;
  let totalMinutosProdutivos = 0;
  let totalMinutosOutros = 0;
  let totalMinutosAlmoco = 0;
  let totalMinutosBanheiro = 0;
  let totalCargaPrevistaMin = 0;
  let totalMetaEfetivaMin = 0;
  let totalContabilizadosMin = 0;
  let totalSaldoMin = 0;
  let diasAtingiuMeta = 0;
  let diasNaoAtingiuMeta = 0;
  let totalHoraExtraMin = 0;
  let totalDeficitMin = 0;
  let diasComHoraExtra = 0;
  let diasComDeficit = 0;
  let diasCumpriuJornada = 0;
  let diasNaoCumpriuJornada = 0;
  let totalAtrasoMin = 0;
  let totalSaidaAntecipadaMin = 0;
  let totalMetaProdutivaMin = 0;
  let totalGapNaoProdutivoMin = 0;
  let diasAtingiuMetaProdutiva = 0;

  for (const dia of dias) {
    totalMinutosTrabalhados += dia.resumo.totalMinutos;
    totalMinutosProdutivos += dia.resumo.minutosProdu;
    totalMinutosOutros += dia.resumo.minutosOutros;
    totalMinutosAlmoco += dia.resumo.minutosAlmoco;
    totalMinutosBanheiro += dia.resumo.minutosBanheiro;
    totalCargaPrevistaMin += dia.meta.cargaHorariaPrevistaMin;
    totalMetaEfetivaMin += dia.meta.metaEfetivaMin;
    totalContabilizadosMin += dia.meta.minutosContabilizados;
    totalSaldoMin += dia.meta.saldoMin;
    totalMetaProdutivaMin += dia.meta.metaProdutivaMin;
    totalGapNaoProdutivoMin += dia.meta.gapNaoProdutivoMin;

    if (dia.meta.atingiuMeta) {
      diasAtingiuMeta++;
    } else {
      diasNaoAtingiuMeta++;
    }

    if (dia.meta.atingiuMetaProdutiva) {
      diasAtingiuMetaProdutiva++;
    }

    if (dia.meta.horaExtraMin > 0) {
      totalHoraExtraMin += dia.meta.horaExtraMin;
      diasComHoraExtra++;
    }
    if (dia.meta.saldoMin < 0) {
      totalDeficitMin += Math.abs(dia.meta.saldoMin);
      diasComDeficit++;
    }

    if (dia.jornada) {
      if (dia.jornada.cumpriuJornada) {
        diasCumpriuJornada++;
      } else {
        diasNaoCumpriuJornada++;
      }
      totalAtrasoMin += dia.jornada.atrasoMin;
      totalSaidaAntecipadaMin += dia.jornada.saidaAntecipadaMin;
    }
  }

  const totalDias = dias.length;
  // Aproveitamento geral = ATVP / Jornada disponivel (total - almoco - banheiro)
  const aproveitamentoGeralPercent = totalContabilizadosMin > 0
    ? Math.round((totalMinutosProdutivos / totalContabilizadosMin) * 100)
    : 0;
  const desempenhoGeralPercent = totalMetaProdutivaMin > 0
    ? Math.round((totalMinutosProdutivos / totalMetaProdutivaMin) * 100)
    : 0;

  return {
    totalMinutosTrabalhados,
    totalMinutosProdutivos,
    totalMinutosOutros,
    totalMinutosAlmoco,
    totalMinutosBanheiro,
    totalCargaPrevistaMin,
    totalMetaEfetivaMin,
    totalContabilizadosMin,
    totalSaldoMin,
    percentProdutivoGeral: totalMinutosTrabalhados > 0
      ? Math.round((totalMinutosProdutivos / totalMinutosTrabalhados) * 100)
      : 0,
    diasAtingiuMeta,
    diasNaoAtingiuMeta,
    percentDiasComMeta: totalDias > 0
      ? Math.round((diasAtingiuMeta / totalDias) * 100)
      : 0,
    mediaDiariaMinutos: totalDias > 0
      ? Math.round(totalContabilizadosMin / totalDias)
      : 0,
    mediaDiariaPercent: totalDias > 0
      ? Math.round(dias.reduce((s, d) => s + d.meta.percentMeta, 0) / totalDias)
      : 0,
    totalHoraExtraMin,
    totalDeficitMin,
    diasComHoraExtra,
    diasComDeficit,
    diasCumpriuJornada,
    diasNaoCumpriuJornada,
    totalAtrasoMin,
    totalSaidaAntecipadaMin,
    totalMetaProdutivaMin,
    totalGapNaoProdutivoMin,
    aproveitamentoGeralPercent,
    desempenhoGeralPercent,
    diasAtingiuMetaProdutiva,
    mediaDiariaProdMin: totalDias > 0
      ? Math.round(totalMinutosProdutivos / totalDias)
      : 0,
  };
}
