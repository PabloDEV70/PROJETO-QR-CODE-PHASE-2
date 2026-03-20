/**
 * Faixas de produtividade — UNICA FONTE DE VERDADE.
 * Espelha FAIXA_META do backend (rdo-diagnostico.ts).
 */
export const FAIXA_META = [
  { minPct: 95, label: 'Na meta',  color: '#16A34A' },
  { minPct: 85, label: 'Quase la', color: '#F59E0B' },
  { minPct: 70, label: 'Atencao',  color: '#F59E0B' },
  { minPct: 0,  label: 'Critico',  color: '#EF4444' },
] as const;

/** Returns hex color for a given produtividadePercent */
export function prodColor(pct: number | null | undefined): string {
  if (pct == null) return '#9E9E9E';
  for (const f of FAIXA_META) {
    if (pct >= f.minPct) return f.color;
  }
  return '#EF4444';
}

/** Returns label for a given produtividadePercent */
export function prodLabel(pct: number | null | undefined): string {
  if (pct == null) return '-';
  for (const f of FAIXA_META) {
    if (pct >= f.minPct) return f.label;
  }
  return 'Critico';
}

/** Returns MUI LinearProgress color name */
export function prodProgressColor(pct: number | null | undefined): 'success' | 'warning' | 'error' {
  if (pct == null) return 'warning';
  if (pct >= 85) return 'success';
  if (pct >= 70) return 'warning';
  return 'error';
}
