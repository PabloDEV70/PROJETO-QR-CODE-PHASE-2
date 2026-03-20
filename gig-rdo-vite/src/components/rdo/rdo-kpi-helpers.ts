import { differenceInDays, subDays, format, parseISO } from 'date-fns';
import type { RdoAnalyticsResumo, RdoComparativo } from '@/types/rdo-types';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import { fmtMin } from '@/utils/wrench-time-categories';

export { fmtMin };

export function fmtDelta(v: number, suffix: string, invert = false): string {
  const d = invert ? -v : v;
  return `${d > 0 ? '+' : ''}${d.toFixed(d % 1 === 0 ? 0 : 1)}${suffix}`;
}

export function ln(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join('\n');
}

export function computeAnteriorRange(dataInicio?: string, dataFim?: string) {
  if (!dataInicio || !dataFim) return null;
  const ini = parseISO(dataInicio);
  const fim = parseISO(dataFim);
  const diffDays = differenceInDays(fim, ini) + 1;
  const anteriorFim = subDays(ini, 1);
  const anteriorInicio = subDays(anteriorFim, diffDays - 1);
  return {
    label: `${format(anteriorInicio, 'dd/MM')}\u2013${format(anteriorFim, 'dd/MM')}`,
  };
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface KpiDef {
  key: string; label: string; icon: React.ReactNode;
  color: string; bg: string; value: string;
  delta?: number; deltaFmt?: string; hero?: boolean; tooltip: string;
  trend?: TrendDirection; trendLabel?: string;
}

/** Detect trend from last N timeline points. */
export function detectTrend(
  timeline: RdoTimelinePoint[] | undefined,
  accessor: (p: RdoTimelinePoint) => number,
  windowSize = 3,
): { direction: TrendDirection; label: string } | null {
  if (!timeline || timeline.length < windowSize + 1) return null;
  const recent = timeline.slice(-windowSize);
  const earlier = timeline.slice(-(windowSize * 2 + 1), -windowSize);
  if (earlier.length === 0) return null;
  const recentAvg = recent.reduce((s, p) => s + accessor(p), 0) / recent.length;
  const earlierAvg = earlier.reduce((s, p) => s + accessor(p), 0) / earlier.length;
  if (earlierAvg === 0) return null;
  const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  if (Math.abs(change) < 5) return { direction: 'stable', label: 'Estavel' };
  // Check consecutive direction
  let consec = 0;
  for (let i = recent.length - 1; i > 0; i--) {
    const diff = accessor(recent[i]!) - accessor(recent[i - 1]!);
    if (change > 0 && diff > 0) consec++;
    else if (change < 0 && diff < 0) consec++;
    else break;
  }
  const dir: TrendDirection = change > 0 ? 'up' : 'down';
  const label = consec >= 2
    ? `${consec + 1} dias consecutivos ${dir === 'up' ? 'subindo' : 'caindo'}`
    : `${dir === 'up' ? 'Subindo' : 'Caindo'} ${Math.abs(change).toFixed(0)}%`;
  return { direction: dir, label };
}

export interface TopMotivo {
  sigla: string; descricao: string; pct: number;
  duracao: string; totalDuracao: string; count: number; category: string;
}

export function computeTopMotivo(
  groups?: MotivoGroup[], totalMin?: number,
): TopMotivo | null {
  if (!groups?.length || !totalMin || totalMin <= 0) return null;
  const top = groups[0]!;
  const pct = (top.totalMin / totalMin) * 100;
  return {
    sigla: top.sigla, descricao: top.descricao,
    pct: Number(pct.toFixed(0)),
    duracao: fmtMin(top.totalMin),
    totalDuracao: fmtMin(totalMin),
    count: top.count, category: top.category,
  };
}

export interface BuildCardsParams {
  resumo: RdoAnalyticsResumo;
  comparativo?: RdoComparativo;
  topMotivo: TopMotivo | null;
  antRange: { label: string } | null;
  produtividadePercent?: number;
  configMode?: string;
  motivosProdutivos?: string[];
  totalProdMin?: number;
  totalNaoProdMin?: number;
  totalMetaEfetivaMin?: number;
  totalMinutosPrevistos?: number;
  totalToleranciaDeducaoMin?: number;
  prodVsMetaPercent?: number;
  timeline?: RdoTimelinePoint[];
  icons: Record<string, React.ReactNode>;
}

export function buildKpiCards(p: BuildCardsParams): KpiDef[] {
  const { resumo: r, comparativo, topMotivo: tm, antRange, icons, timeline } = p;
  const d = comparativo?.deltas;
  const ant = comparativo?.anterior;
  const ml = p.configMode === 'ESTRITO' ? 'Estrito' : p.configMode === 'CUSTOM' ? 'Custom' : 'Amplo';
  const pj = p.motivosProdutivos?.join(', ') || 'ATVP';
  const hT = detectTrend(timeline, (pt) => Math.max(0, Number(pt.totalHoras)));
  const cT = detectTrend(timeline, (pt) => Number(pt.totalColaboradores));
  const pT = detectTrend(timeline, (pt) => {
    const t = Math.max(0, Number(pt.totalHoras) || 0);
    const pr = Math.max(0, Number(pt.horasProdutivas) || 0);
    return t > 0 ? (pr / t) * 100 : 0;
  });
  const antLbl = (v: string) => `Anterior${antRange ? ` (${antRange.label})` : ''}: ${v}`;
  const prodVal = p.totalProdMin != null && p.totalMetaEfetivaMin
    ? `${(p.totalProdMin / 60).toFixed(1)} / ${(p.totalMetaEfetivaMin / 60).toFixed(1)}h`
    : r.totalHoras?.toFixed(1) ?? '-';
  const pp = p.produtividadePercent;
  return [
    { key: 'horas', label: 'TOTAL HORAS', icon: icons.horas, hero: true,
      trend: hT?.direction, trendLabel: hT?.label,
      color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', value: prodVal,
      delta: d?.totalHoras, deltaFmt: d ? fmtDelta(d.totalHoras, 'h') : undefined,
      tooltip: ln('Horas produtivas realizadas / Meta efetiva (jornada - tolerancias)',
        p.totalProdMin != null && `Produtivas: ${fmtMin(p.totalProdMin)}`,
        p.totalMetaEfetivaMin ? `Meta efetiva: ${fmtMin(p.totalMetaEfetivaMin)}` : false,
        p.totalMinutosPrevistos ? `Jornada bruta: ${fmtMin(p.totalMinutosPrevistos)}` : false,
        p.totalToleranciaDeducaoMin ? `Tolerancias: -${fmtMin(p.totalToleranciaDeducaoMin)}` : false,
        `Apontado: ${r.totalHoras?.toFixed(1) || 0}h (${r.totalDetalhes?.toLocaleString('pt-BR') || 0} apt)`,
        `${r.diasComDados || 0} dias | Media ${r.mediaHorasDia?.toFixed(1) || 0}h/dia`,
        ant && antLbl(`${Number(ant.totalHoras).toFixed(1)}h`)) },
    { key: 'prodPct', label: 'PRODUTIVIDADE %', icon: icons.prodPct, hero: true,
      trend: pT?.direction, trendLabel: pT?.label,
      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
      value: pp != null ? `${pp}% / ${100 - pp}%` : '-',
      tooltip: ln(`Modo: ${ml}`, `Motivos produtivos: ${pj}`,
        pp != null ? `Produtivo: ${pp}% | Nao produtivo: ${100 - pp}%` : false,
        p.totalProdMin != null ? `Min produtivos: ${fmtMin(p.totalProdMin)}` : false,
        p.totalNaoProdMin != null ? `Min nao produtivos: ${fmtMin(p.totalNaoProdMin)}` : false,
        p.totalMetaEfetivaMin ? `Meta efetiva: ${fmtMin(p.totalMetaEfetivaMin)}` : false,
        p.prodVsMetaPercent != null ? `Realizacao vs meta: ${p.prodVsMetaPercent}%` : false) },
    { key: 'top', label: 'TOP MOTIVO', icon: icons.top,
      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
      value: tm ? `${tm.pct}%` : '-', deltaFmt: tm?.sigla || undefined,
      tooltip: tm
        ? ln(`${tm.descricao} (${tm.sigla})`, `${tm.duracao} de ${tm.totalDuracao} total`,
          `${tm.count} apontamentos`, `Categoria: ${tm.category}`)
        : 'Motivo com maior tempo no periodo' },
    { key: 'rdos', label: 'TOTAL RDOS', icon: icons.rdos,
      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
      value: r.totalRdos?.toLocaleString('pt-BR') ?? '-',
      delta: d?.totalRdos, deltaFmt: d ? fmtDelta(d.totalRdos, '') : undefined,
      tooltip: ln('1 RDO = 1 dia de trabalho de 1 colaborador',
        `Media ${r.mediaRdosPorColab?.toFixed(1) || '-'} RDOs/colab`,
        `Media ${r.mediaItensPorRdo?.toFixed(1) || '-'} itens/RDO`,
        ant && antLbl(Number(ant.totalRdos).toLocaleString('pt-BR'))) },
    { key: 'colabs', label: 'COLABORADORES', icon: icons.colabs,
      trend: cT?.direction, trendLabel: cT?.label,
      color: '#06B6D4', bg: 'rgba(6,182,212,0.08)',
      value: r.totalColaboradores?.toLocaleString('pt-BR') ?? '-',
      delta: d?.totalColaboradores, deltaFmt: d ? fmtDelta(d.totalColaboradores, '') : undefined,
      tooltip: ln('Colaboradores distintos com RDO no periodo',
        ant && antLbl(Number(ant.totalColaboradores).toLocaleString('pt-BR'))) },
    { key: 'os', label: '% COM OS', icon: icons.os,
      color: '#EC4899', bg: 'rgba(236,72,153,0.08)',
      value: r.percentualComOs != null ? `${r.percentualComOs.toFixed(0)}%` : '-',
      delta: d?.percentualComOs, deltaFmt: d ? fmtDelta(d.percentualComOs, '%') : undefined,
      tooltip: ln('% de apontamentos vinculados a uma OS',
        `${r.totalDetalhes?.toLocaleString('pt-BR') || 0} apontamentos totais`) },
    { key: 'media', label: 'HRS/COLAB/DIA', icon: icons.media,
      color: '#78909c', bg: 'rgba(120,144,156,0.08)',
      value: r.mediaHorasPorColabDia != null ? `${r.mediaHorasPorColabDia.toFixed(1)}h` : '-',
      delta: d?.mediaMinutosPorItem, deltaFmt: d ? fmtDelta(d.mediaMinutosPorItem, 'min', true) : undefined,
      tooltip: ln('Total horas / Total RDOs',
        `${r.totalHoras?.toFixed(1) || 0}h / ${r.totalRdos || 0} RDOs`) },
  ];
}
