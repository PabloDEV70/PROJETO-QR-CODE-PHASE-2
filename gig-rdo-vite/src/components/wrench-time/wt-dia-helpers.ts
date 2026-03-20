import type { WrenchTimeBreakdown } from '@/types/wrench-time-types';

type ColabItem = {
  categoryBreakdown: Array<{
    category: string;
    label: string;
    color: string;
    tips: string;
    totalMin: number;
    motivos: Array<{ cod: number; sigla: string; descricao: string; totalMin: number }>;
  }>;
};

export function fmtBr(d: string) {
  return d.length >= 10 ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : d;
}

/** Aggregate per-colab breakdowns into a single day-level breakdown list */
export function aggregateBreakdowns(colabs: ColabItem[]): WrenchTimeBreakdown[] {
  const catMap = new Map<string, {
    label: string; color: string; tips: string; totalMin: number;
    motivos: Map<number, { cod: number; sigla: string; descricao: string; totalMin: number }>;
  }>();
  for (const c of colabs) {
    for (const b of c.categoryBreakdown) {
      const entry = catMap.get(b.category) ?? {
        label: b.label, color: b.color, tips: b.tips, totalMin: 0,
        motivos: new Map(),
      };
      entry.totalMin += b.totalMin;
      for (const m of b.motivos) {
        const prev = entry.motivos.get(m.cod);
        if (prev) prev.totalMin += m.totalMin;
        else entry.motivos.set(m.cod, { ...m });
      }
      catMap.set(b.category, entry);
    }
  }
  const grandTotal = Array.from(catMap.values()).reduce((s, e) => s + e.totalMin, 0);
  return Array.from(catMap.entries())
    .map(([category, e]) => {
      const motivos = Array.from(e.motivos.values())
        .map((m) => ({
          ...m,
          percentOfCategory: e.totalMin > 0 ? Math.round((m.totalMin / e.totalMin) * 100) : 0,
        }))
        .sort((a, b) => b.totalMin - a.totalMin);
      return {
        category, label: e.label, color: e.color, tips: e.tips,
        totalMin: e.totalMin,
        percentOfTotal: grandTotal > 0 ? Math.round((e.totalMin / grandTotal) * 100) : 0,
        motivos,
      };
    })
    .sort((a, b) => {
      if (a.category === 'wrenchTime') return -1;
      if (b.category === 'wrenchTime') return 1;
      return b.totalMin - a.totalMin;
    });
}
