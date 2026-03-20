import { useMemo } from 'react';
import { useRdoTimeline } from '@/hooks/use-rdo-analytics';
import type { RdoTimelinePoint } from '@/types/rdo-analytics-types';
import type { RdoDetalhesParams } from '@/types/rdo-types';

type FilterParams = Omit<RdoDetalhesParams, 'page' | 'limit'>;

export interface TrendPoint {
  date: string;
  label: string;
  wtPercent: number;
  prodMin: number;
  nonProdMin: number;
  totalMin: number;
  expectedMin: number;
  overtimeMin: number;
  overtimeProdMin: number;
  overtimeNonProdMin: number;
  ma7: number | null;
}

/**
 * WT% comes from horasProdutivas in timeline SQL (uses WTCATEGORIA='wrenchTime').
 * Same DB classification used by detail page — no frontend config needed.
 */
export function useWrenchTimeTrend(filterParams: FilterParams) {
  const timeline = useRdoTimeline(filterParams as Record<string, string | number>);

  const trend = useMemo((): TrendPoint[] => {
    if (!timeline.data?.length) return [];

    const points: TrendPoint[] = timeline.data.map((p: RdoTimelinePoint) => {
      const totalH = Math.max(0, Number(p.totalHoras) || 0);
      const prodH = Math.max(0, Math.min(Number(p.horasProdutivas) || 0, totalH));
      const totalMin = Math.round(totalH * 60);
      const prodMin = Math.round(prodH * 60);
      const nonProdMin = totalMin - prodMin;
      const wtPct = totalMin > 0 ? Math.round((prodMin / totalMin) * 100) : 0;
      const dt = p.DTREF.slice(0, 10);
      const expectedMin = Number(p.minutosPrevistos) || 0;
      const overtimeMin = Number(p.minutosHoraExtra) || 0;
      const overtimeProdMin = Number(p.minutosHoraExtraProd) || 0;
      const overtimeNonProdMin = Number(p.minutosHoraExtraNaoProd) || 0;
      return {
        date: dt, label: `${dt.slice(8, 10)}/${dt.slice(5, 7)}`,
        wtPercent: wtPct, prodMin, nonProdMin, totalMin, expectedMin,
        overtimeMin, overtimeProdMin, overtimeNonProdMin, ma7: null,
      };
    });

    for (let i = 0; i < points.length; i++) {
      const window = points.slice(Math.max(0, i - 6), i + 1);
      points[i]!.ma7 = Math.round(
        window.reduce((s, pt) => s + pt.wtPercent, 0) / window.length,
      );
    }

    return points;
  }, [timeline.data]);

  return { ...timeline, trend };
}
