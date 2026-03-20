import { useMemo } from 'react';
import { format, parseISO, startOfWeek, getISOWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RdoTimelinePoint } from '@/types/rdo-types';

type Metric = 'horas' | 'rdos' | 'itens';
type Agrupamento = 'diario' | 'semanal';

export interface ChartRow {
  label: string; valor: number; media: number | null;
  colabs: number; tooltip: string;
}

function getValue(p: RdoTimelinePoint, metric: Metric): number {
  const raw = metric === 'horas' ? p.totalHoras
    : metric === 'rdos' ? p.totalRdos : p.totalItens;
  return Math.max(0, Number(raw) || 0);
}

function rollingAvg(data: number[], window: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < window - 1) return null;
    const slice = data.slice(i - window + 1, i + 1);
    return Number((slice.reduce((s, v) => s + v, 0) / slice.length).toFixed(1));
  });
}

export function useEvolutionData(
  data: RdoTimelinePoint[] | undefined,
  metric: Metric,
  agrup: Agrupamento,
  isMobile: boolean,
) {
  const chartData = useMemo((): ChartRow[] => {
    if (!data?.length) return [];

    if (agrup === 'semanal') {
      const weeks = new Map<string, { values: number[]; colabs: number[]; dates: string[] }>();
      for (const p of data) {
        const dt = parseISO(p.DTREF);
        const wk = format(startOfWeek(dt, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const entry = weeks.get(wk) ?? { values: [], colabs: [], dates: [] };
        entry.values.push(getValue(p, metric));
        entry.colabs.push(p.totalColaboradores);
        entry.dates.push(format(dt, 'dd/MM'));
        weeks.set(wk, entry);
      }
      const rows: ChartRow[] = [];
      for (const [wk, w] of weeks) {
        const total = w.values.reduce((s, v) => s + v, 0);
        const avgColabs = Math.round(w.colabs.reduce((s, v) => s + v, 0) / w.colabs.length);
        const weekNum = getISOWeek(parseISO(wk));
        rows.push({
          label: `S${weekNum}`,
          valor: Number(total.toFixed(1)),
          media: null,
          colabs: avgColabs,
          tooltip: `Sem ${weekNum} (${w.dates[0]} - ${w.dates[w.dates.length - 1]}) | ${w.values.length} dias`,
        });
      }
      const vals = rows.map((r) => r.valor);
      const avgs = rollingAvg(vals, Math.min(3, rows.length));
      rows.forEach((r, i) => { r.media = avgs[i] ?? null; });
      return rows;
    }

    const dailyVals = data.map((p) => getValue(p, metric));
    const avgs = rollingAvg(dailyVals, 3);
    return data.map((p, i) => ({
      label: format(parseISO(p.DTREF), isMobile ? 'dd/MM' : 'dd MMM', { locale: ptBR }),
      valor: dailyVals[i]!,
      media: avgs[i] ?? null,
      colabs: p.totalColaboradores,
      tooltip: format(parseISO(p.DTREF), "EEEE, dd 'de' MMMM", { locale: ptBR }),
    }));
  }, [data, metric, agrup, isMobile]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const half = Math.floor(chartData.length / 2);
    const first = chartData.slice(0, half);
    const second = chartData.slice(half);
    const avg1 = first.reduce((s, r) => s + r.valor, 0) / first.length;
    const avg2 = second.reduce((s, r) => s + r.valor, 0) / second.length;
    if (avg1 === 0) return null;
    const pct = ((avg2 - avg1) / avg1) * 100;
    return { pct: pct.toFixed(0), up: pct > 0, label: '2a metade' };
  }, [chartData]);

  return { chartData, trend };
}
