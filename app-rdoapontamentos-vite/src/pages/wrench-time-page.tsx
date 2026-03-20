import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Grid, Stack, Typography } from '@mui/material';
import { Build } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtKpiRow } from '@/components/wrench-time/wt-kpi-row';
import { WtCategoryDonut } from '@/components/wrench-time/wt-category-donut';
import { WtTopLosses } from '@/components/wrench-time/wt-top-losses';
import { WtDailyStack } from '@/components/wrench-time/wt-daily-stack';
import { WtDailySimple } from '@/components/wrench-time/wt-daily-simple';
import { WtDailyOvertime } from '@/components/wrench-time/wt-daily-overtime';
import { WtAnomaliasAlert } from '@/components/wrench-time/wt-anomalias-alert';
import { WtCalcDebug } from '@/components/wrench-time/wt-calc-debug';
import { WtRankingCards } from '@/components/wrench-time/wt-ranking-cards';
import { WtOvertimeRanking } from '@/components/wrench-time/wt-overtime-ranking';
import { WtColabGrid } from '@/components/wrench-time/wt-colab-grid';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import {
  useRdoResumoAnalytics,
  useRdoAnomalias,
  useRdoRanking,
  useRdoOvertimeRanking,
} from '@/hooks/use-rdo-analytics';
import { useWrenchTimeMetrics } from '@/hooks/use-wrench-time';
import { useWrenchTimeTrend } from '@/hooks/use-wrench-time-trend';

export function WrenchTimePage() {
  const {
    dataInicio, dataFim, codparc, coddep, codfuncao,
    filterParams, updateParams, clearAll,
  } = useRdoUrlParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const resumo = useRdoResumoAnalytics(filterParams);
  const anomalias = useRdoAnomalias(filterParams);
  const { metrics, isLoading, error } = useWrenchTimeMetrics(filterParams);
  const { trend, isLoading: trendLoading } = useWrenchTimeTrend(filterParams);
  const ranking = useRdoRanking(filterParams);
  const overtimeRanking = useRdoOvertimeRanking(filterParams);

  const overtimeTotals = useMemo(() => {
    if (!trend.length) return { min: 0, prod: 0, nonProd: 0 };
    return trend.reduce(
      (acc, t) => ({
        min: acc.min + t.overtimeMin,
        prod: acc.prod + t.overtimeProdMin,
        nonProd: acc.nonProd + t.overtimeNonProdMin,
      }),
      { min: 0, prod: 0, nonProd: 0 },
    );
  }, [trend]);

  const handleBarClick = useCallback((date: string) => {
    const qs = new URLSearchParams();
    if (coddep) qs.set('coddep', coddep);
    if (codfuncao) qs.set('codfuncao', codfuncao);
    if (codparc) qs.set('codparc', codparc);
    const qsStr = qs.toString();
    navigate(`/wrench-time/dia/${date}${qsStr ? `?${qsStr}` : ''}`);
  }, [navigate, coddep, codfuncao, codparc]);

  return (
    <PageLayout title="Wrench Time" subtitle="Eficiencia real da manutencao" icon={Build}>
      <RdoFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalRdos}
        totalLabel="RDOs" isLoading={resumo.isLoading}
      />

      {(anomalias.data?.length ?? 0) > 0 && (
        <WtAnomaliasAlert anomalias={anomalias.data!} />
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erro ao carregar dados de Wrench Time</Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <WtKpiRow
          wrenchTimePercent={metrics?.wrenchTimePercent ?? null}
          totalProdMin={metrics?.totalProdMin ?? 0}
          totalLossMin={metrics?.totalLossMin ?? 0}
          topLossCategory={metrics?.topLossCategory ?? null}
          topLossMin={metrics?.topLossMin ?? 0}
          totalColaboradores={resumo.data?.totalColaboradores ?? null}
          benchmarkStatus={metrics?.benchmarkStatus ?? null}
          overtimeMin={overtimeTotals.min}
          overtimeProdMin={overtimeTotals.prod}
          overtimeNonProdMin={overtimeTotals.nonProd}
          isLoading={isLoading}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <WtCategoryDonut
              breakdowns={metrics?.breakdowns ?? []}
              wrenchTimePercent={metrics?.wrenchTimePercent ?? 0}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <WtTopLosses
              breakdowns={metrics?.breakdowns ?? []}
              deductions={metrics?.deductions}
              dataInicio={dataInicio} dataFim={dataFim}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>

        <WtRankingCards
          ranking={ranking.data}
          isLoading={ranking.isLoading}
          extra={
            <WtOvertimeRanking
              data={overtimeRanking.data}
              isLoading={overtimeRanking.isLoading}
            />
          }
        />

        <WtDailySimple data={trend} isLoading={trendLoading} onBarClick={handleBarClick} />
        <WtDailyStack data={trend} isLoading={trendLoading} onBarClick={handleBarClick} />
        <WtDailyOvertime data={trend} isLoading={trendLoading} onBarClick={handleBarClick} />

        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Produtividade por Colaborador ({ranking.data?.length ?? 0})
          </Typography>
          <WtColabGrid data={ranking.data} isLoading={ranking.isLoading} />
        </Stack>

        {metrics && (
          <WtCalcDebug
            deductions={metrics.deductions}
            wrenchTimePercent={metrics.wrenchTimePercent}
            totalProdMin={metrics.totalProdMin}
            totalLossMin={metrics.totalLossMin}
          />
        )}
      </Stack>

      <RdoFilterDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams}
        filterParams={filterParams}
      />
    </PageLayout>
  );
}

export default WrenchTimePage;
