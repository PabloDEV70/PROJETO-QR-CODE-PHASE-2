/**
 * Pure function that computes actionable alerts from existing dashboard data.
 * Zero backend changes — all data comes from existing endpoints.
 */
import type { RdoAnalyticsProdutividade, AssiduidadePorColaborador } from '@/types/rdo-analytics-types';
import type { DashboardData } from '@/hooks/use-rdo-dashboard';

export interface RdoAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  codparc?: number;
  motivo?: number;
  metric: string;
}

interface AlertParams {
  produtividade?: RdoAnalyticsProdutividade[];
  assiduidade?: AssiduidadePorColaborador[];
  dashboard: DashboardData | null;
  dataInicio?: string;
  dataFim?: string;
}

function alertId(metric: string, key: string | number, period?: string): string {
  return `${metric}:${key}:${period ?? 'all'}`;
}

/** Detect collaborators with very low productivity (< 50% of team average hours). */
function detectLowProductivity(
  prods: RdoAnalyticsProdutividade[],
  period?: string,
): RdoAlert[] {
  if (prods.length < 2) return [];
  const avgHoras = prods.reduce((s, p) => s + p.totalHoras, 0) / prods.length;
  if (avgHoras <= 0) return [];
  const threshold = avgHoras * 0.5;
  return prods
    .filter((p) => p.totalHoras < threshold && p.totalHoras > 0)
    .map((p) => {
      const pct = Math.round((p.totalHoras / avgHoras) * 100);
      const diff = Math.round(avgHoras - p.totalHoras);
      return {
        id: alertId('produtividade', p.codparc, period),
        severity: 'critical' as const,
        title: `${p.nomeparc}: ${p.totalHoras.toFixed(1)}h (${pct}% da media)`,
        detail: `${diff.toFixed(0)}h abaixo da media da equipe (${avgHoras.toFixed(1)}h)`,
        codparc: p.codparc,
        metric: 'produtividade',
      };
    });
}

/** Detect excessive ESPERA time (> 20% of total). */
function detectHighEspera(dashboard: DashboardData, period?: string): RdoAlert[] {
  const alerts: RdoAlert[] = [];
  const espera = dashboard.groups.find((g) => g.category === 'ESPERA');
  if (!espera || dashboard.treemap.totalMin <= 0) return alerts;
  const pct = Math.round((espera.totalMin / dashboard.treemap.totalMin) * 100);
  if (pct > 20) {
    alerts.push({
      id: alertId('espera', 'global', period),
      severity: 'warning',
      title: `ESPERA representou ${pct}% do tempo`,
      detail: `${Math.round(espera.totalMin / 60)}h em espera — acima do esperado`,
      metric: 'espera',
    });
  }
  return alerts;
}

/** Detect meta not reached (< 80% prodVsMeta). */
function detectMetaNotReached(dashboard: DashboardData, period?: string): RdoAlert[] {
  const pvm = dashboard.productivity.prodVsMetaPercent;
  if (pvm == null || pvm >= 80) return [];
  return [{
    id: alertId('meta', 'global', period),
    severity: 'warning',
    title: `Meta atingida em apenas ${pvm}%`,
    detail: 'Realizacao abaixo de 80% da meta efetiva',
    metric: 'meta',
  }];
}

/** Detect low overall productivity (< 40% productive time). */
function detectLowTeamProductivity(
  dashboard: DashboardData,
  period?: string,
): RdoAlert[] {
  const pct = dashboard.productivity.produtividadePercent;
  if (pct >= 40) return [];
  return [{
    id: alertId('improdutivo', 'global', period),
    severity: 'warning',
    title: `Tempo produtivo em apenas ${pct}%`,
    detail: 'Mais de 60% do tempo apontado e nao produtivo',
    metric: 'improdutivo',
  }];
}

/** Detect collaborators below 80% of target in assiduidade. */
function detectLowAssiduidade(
  assiduidade: AssiduidadePorColaborador[],
  period?: string,
): RdoAlert[] {
  const low = assiduidade.filter((a) => a.percentCumprimento < 80);
  if (low.length === 0) return [];
  return [{
    id: alertId('assiduidade', 'count', period),
    severity: 'info',
    title: `${low.length} colaborador${low.length > 1 ? 'es' : ''} abaixo de 80% da meta`,
    detail: low.slice(0, 3).map((a) => `${a.nomeparc} ${a.percentCumprimento}%`).join(', '),
    metric: 'assiduidade',
  }];
}

/** Main alert computation — pure function, no side effects. */
export function computeAlerts(params: AlertParams): RdoAlert[] {
  const { produtividade, assiduidade, dashboard, dataInicio } = params;
  if (!dashboard) return [];
  const period = dataInicio ?? 'all';
  const alerts: RdoAlert[] = [];

  if (produtividade?.length) {
    alerts.push(...detectLowProductivity(produtividade, period));
  }
  alerts.push(...detectHighEspera(dashboard, period));
  alerts.push(...detectMetaNotReached(dashboard, period));
  alerts.push(...detectLowTeamProductivity(dashboard, period));
  if (assiduidade?.length) {
    alerts.push(...detectLowAssiduidade(assiduidade, period));
  }

  // Sort: critical > warning > info
  const order = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  return alerts;
}
