import type { RdoAnalyticsResumo, RdoComparativo } from '@/types/rdo-types';
import type { ProductivityResult } from '@/utils/motivo-productivity';

export interface TopMotivoV1 {
  sigla: string;
  descricao: string;
  horas: string;
}

export interface KpiDefV1 {
  key: string; label: string; icon: React.ReactNode;
  color: string; bg: string; value: string;
  delta?: number; deltaFmt?: string; hero?: boolean; tooltip: string;
}

export function fmtDelta(v: number, suffix: string, invert = false): string {
  const d = invert ? -v : v;
  return `${d > 0 ? '+' : ''}${d.toFixed(d % 1 === 0 ? 0 : 1)}${suffix}`;
}

function ln(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join('\n');
}

export function fmtHMin(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return h > 0 ? `${h}h${m > 0 ? `${String(m).padStart(2, '0')}m` : ''}` : `${m}m`;
}

export function buildTooltipsV1(
  r: RdoAnalyticsResumo,
  comp: RdoComparativo | null,
  tm: TopMotivoV1 | null,
  prod?: ProductivityResult,
) {
  const ant = comp?.anterior;
  return {
    meta: prod ? ln(
      `Produtivo: ${fmtHMin(prod.totalProdMin)} (${prod.prodVsMetaPercent ?? 0}% da meta)`,
      prod.totalNaoProdMin > 0 ? `Improdutivo: ${fmtHMin(prod.totalNaoProdMin)} (${
        prod.totalMetaEfetivaMin ? Math.round((prod.totalNaoProdMin / prod.totalMetaEfetivaMin) * 100) : 0
      }% da meta)` : null,
      prod.totalMetaEfetivaMin
        ? `Meta efetiva: ${fmtHMin(prod.totalMetaEfetivaMin)} (jornada ${fmtHMin(r.totalMinutosPrevistos ?? 0)} - tolerancias)` : null,
      prod.totalToleranciaDeducaoMin
        ? `Tolerancias: ${fmtHMin(prod.totalToleranciaDeducaoMin)} descontadas` : null,
    ) : 'Sem dados de produtividade',
    horasProd: prod ? ln(
      `${fmtHMin(prod.totalProdMin)} produtivas de ${fmtHMin(prod.totalMetaEfetivaMin ?? 0)} meta`,
      `${r.totalDetalhes || 0} apontamentos no periodo`,
      ant && `Periodo anterior: ${Number(ant.totalHoras).toFixed(1)}h`,
    ) : ln(
      `${r.totalDetalhes?.toLocaleString('pt-BR') || 0} apontamentos no periodo`,
      ant && `Periodo anterior: ${Number(ant.totalHoras).toFixed(1)}h`,
    ),
    prod: tm
      ? ln(`${tm.descricao} (${tm.sigla})`,
        `${tm.horas}h no periodo`,
        'Motivo com maior tempo no periodo')
      : 'Motivo com maior tempo no periodo',
    rdos: ln(
      '1 RDO = 1 dia de trabalho de 1 colaborador',
      `${r.totalColaboradores || 0} colaboradores distintos`,
      `${r.diasComDados || 0} dias com dados`,
      `Media ${r.mediaItensPorRdo?.toFixed(1) || '-'} apontamentos por RDO`,
      ant && `Periodo anterior: ${Number(ant.totalRdos).toLocaleString('pt-BR')} RDOs`,
    ),
    os: ln('% de apontamentos vinculados a uma Ordem de Servico',
      `${r.totalDetalhes?.toLocaleString('pt-BR') || 0} apontamentos totais`),
  };
}
