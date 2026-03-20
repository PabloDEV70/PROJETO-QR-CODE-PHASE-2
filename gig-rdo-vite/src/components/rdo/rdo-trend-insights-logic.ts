import {
  TrendingUp, TrendingDown, Warning, CheckCircle, HourglassEmpty,
} from '@mui/icons-material';
import { createElement } from 'react';
import type { RdoComparativo, RdoTimelinePoint } from '@/types/rdo-types';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import { fmtMin } from '@/utils/wrench-time-categories';

export interface CategoryRow {
  key: string; label: string; min: number; pct: number;
  color: string; icon: React.ReactNode; motivos: string[];
}

export interface Insight {
  icon: React.ReactElement; text: string;
  severity: 'success' | 'warning' | 'error' | 'info';
  tooltip: string;
}

const icon16 = { fontSize: 16 } as const;

export const CAT_ICONS: Record<string, React.ReactNode> = {
  wrenchTime: createElement('span'), // placeholder, resolved at render
  espera: createElement('span'),
  pausas: createElement('span'),
  desloc: createElement('span'),
  externos: createElement('span'),
  buro: createElement('span'),
  trein: createElement('span'),
};

/** Display order for wtCategoria keys */
const CAT_ORDER = ['wrenchTime', 'espera', 'pausas', 'desloc', 'buro', 'trein', 'externos'];

export function buildCategories(
  groups: MotivoGroup[], totalMin: number,
  catIcons: Record<string, React.ReactNode>,
): CategoryRow[] {
  if (!groups.length || totalMin <= 0) return [];
  const cats = new Map<string, { min: number; motivos: string[] }>();
  for (const g of groups) {
    const key = g.category || 'externos';
    const entry = cats.get(key) ?? { min: 0, motivos: [] };
    entry.min += g.totalMin;
    entry.motivos.push(g.sigla);
    cats.set(key, entry);
  }
  // Build ordered list: known cats first in CAT_ORDER, then any unknown ones
  const orderedKeys = [
    ...CAT_ORDER.filter((k) => cats.has(k)),
    ...[...cats.keys()].filter((k) => !CAT_ORDER.includes(k)),
  ];
  return orderedKeys.map((k) => {
    const c = cats.get(k)!;
    const meta = getCategoryMeta(k);
    return {
      key: k, label: meta.label, min: c.min,
      pct: (c.min / totalMin) * 100,
      color: meta.color, icon: catIcons[k] ?? null, motivos: c.motivos,
    };
  });
}

export function buildInsights(
  categories: CategoryRow[],
  groups: MotivoGroup[],
  totalMin: number,
  comparativo?: RdoComparativo,
  timeline?: RdoTimelinePoint[],
  configMode?: string,
): Insight[] {
  const list: Insight[] = [];
  if (totalMin <= 0) return list;

  const espera = categories.find((c) => c.key === 'espera');
  if (espera && espera.pct > 5) {
    const agd = groups.find((g) => g.sigla.toUpperCase().includes('AGD'));
    const detail = agd ? ` — AGD ${fmtMin(agd.totalMin)} em ${agd.count} ocorrencias` : '';
    list.push({
      icon: createElement(HourglassEmpty, { sx: icon16 }),
      text: `${espera.pct.toFixed(0)}% em ESPERA (${fmtMin(espera.min)})${detail}`,
      severity: espera.pct > 10 ? 'error' : 'warning',
      tooltip: `Motivos: ${espera.motivos.join(', ')}\n${fmtMin(espera.min)} de ${fmtMin(totalMin)} total`,
    });
  }

  const prod = categories.find((c) => c.key === 'wrenchTime');
  if (prod) {
    const modeLabel = configMode === 'ESTRITO' ? 'Estrito' : configMode === 'CUSTOM'
      ? 'Custom' : configMode || 'Estrito';
    list.push({
      icon: createElement(prod.pct >= 60 ? CheckCircle : Warning, { sx: icon16 }),
      text: `${prod.pct.toFixed(0)}% produtivo (${fmtMin(prod.min)})`,
      severity: prod.pct >= 60 ? 'success' : 'warning',
      tooltip: `Modo: ${modeLabel} | ${prod.motivos.length} motivos produtivos\nMotivos: ${prod.motivos.join(', ')}\n${fmtMin(prod.min)} de ${fmtMin(totalMin)} total`,
    });
  }

  const d = comparativo?.deltas;
  if (d) {
    if (d.totalHoras !== 0) {
      const up = d.totalHoras > 0;
      list.push({
        icon: createElement(up ? TrendingUp : TrendingDown, { sx: icon16 }),
        text: `${up ? '+' : ''}${d.totalHoras.toFixed(1)}h vs periodo anterior`,
        severity: up ? 'success' : 'info',
        tooltip: `Atual: ${comparativo?.atual?.totalHoras}h | Anterior: ${comparativo?.anterior?.totalHoras}h`,
      });
    }
  }

  if (timeline?.length) {
    const clean = timeline.map((p) => Math.max(0, Number(p.totalHoras)));
    const avg = clean.reduce((s, v) => s + v, 0) / clean.length;
    const std = Math.sqrt(clean.reduce((s, v) => s + (v - avg) ** 2, 0) / clean.length);
    const outliers = timeline.filter(
      (p) => Math.abs(Math.max(0, Number(p.totalHoras)) - avg) > 2 * std,
    );
    if (outliers.length > 0) {
      list.push({
        icon: createElement(Warning, { sx: icon16 }),
        text: `${outliers.length} dia${outliers.length > 1 ? 's' : ''} atipico${outliers.length > 1 ? 's' : ''}`,
        severity: 'warning',
        tooltip: `Media: ${avg.toFixed(1)}h/dia | Desvio: ${std.toFixed(1)}h\nDias fora de 2x desvio padrao`,
      });
    }
  }

  return list;
}
