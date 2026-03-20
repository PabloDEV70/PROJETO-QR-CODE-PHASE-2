import { useState, useMemo } from 'react';
import { Alert, Grid, Paper, Stack, Typography } from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtTrendChart } from '@/components/wrench-time/wt-trend-chart';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoResumo } from '@/hooks/use-rdo';
import { useWrenchTimeMetrics } from '@/hooks/use-wrench-time';
import { useWrenchTimeTrend } from '@/hooks/use-wrench-time-trend';

function ComparisonCard({ label, value, color }: {
  label: string; value: string; color: string;
}) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', borderTop: 3, borderTopColor: color }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ color }}>{value}</Typography>
    </Paper>
  );
}

export function WrenchTimeTendenciaPage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll,
  } = useRdoUrlParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const resumo = useRdoResumo(filterParams);
  const { trend, isLoading: trendLoading, error } = useWrenchTimeTrend(filterParams);
  const { metrics } = useWrenchTimeMetrics(filterParams);
  const comparison = useMemo(() => {
    if (!trend.length) return null;
    const half = Math.floor(trend.length / 2);
    if (half < 1) return null;
    const first = trend.slice(0, half);
    const second = trend.slice(half);
    const avg1 = Math.round(first.reduce((s, p) => s + p.wtPercent, 0) / first.length);
    const avg2 = Math.round(second.reduce((s, p) => s + p.wtPercent, 0) / second.length);
    const delta = avg2 - avg1;
    return { avg1, avg2, delta };
  }, [trend]);

  return (
    <PageLayout title="Tendencia" subtitle="Evolucao do Wrench Time" icon={Timeline}>
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalRdos}
        totalLabel="RDOs" isLoading={resumo.isLoading}
      />

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erro ao carregar dados</Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <WtTrendChart data={trend} isLoading={trendLoading} />

        {comparison && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ComparisonCard
                label="1a Metade" value={`${comparison.avg1}%`}
                color={comparison.avg1 >= 50 ? '#16A34A' : comparison.avg1 >= 35 ? '#F59E0B' : '#EF4444'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ComparisonCard
                label="2a Metade" value={`${comparison.avg2}%`}
                color={comparison.avg2 >= 50 ? '#16A34A' : comparison.avg2 >= 35 ? '#F59E0B' : '#EF4444'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ComparisonCard
                label="Variacao"
                value={`${comparison.delta >= 0 ? '+' : ''}${comparison.delta}pp`}
                color={comparison.delta >= 0 ? '#16A34A' : '#EF4444'}
              />
            </Grid>
          </Grid>
        )}

        {metrics && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Resumo do Periodo</Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                WT Atual: <strong>{metrics.wrenchTimePercent}%</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: <strong>{Math.round(metrics.totalMin / 60)}h</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Produtivo: <strong>{Math.round(metrics.totalProdMin / 60)}h</strong>
              </Typography>
              {metrics.topLossCategory && (
                <Typography variant="body2" color="text.secondary">
                  Maior perda: <strong>{metrics.topLossCategory}</strong>
                </Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Stack>

      <RdoFilterDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams}
        filterParams={filterParams as Record<string, string | number>}
      />
    </PageLayout>
  );
}
