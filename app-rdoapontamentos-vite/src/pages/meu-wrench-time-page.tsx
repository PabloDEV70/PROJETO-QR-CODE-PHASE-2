import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Stack } from '@mui/material';
import { WtKpiRow } from '@/components/wrench-time/wt-kpi-row';
import { WtCategoryDonut } from '@/components/wrench-time/wt-category-donut';
import { WtTopLosses } from '@/components/wrench-time/wt-top-losses';
import { WtDailySimple } from '@/components/wrench-time/wt-daily-simple';
import { WtCalcDebug } from '@/components/wrench-time/wt-calc-debug';
import { useEffectiveCodparc } from '@/hooks/use-effective-codparc';
import { useWrenchTimeMetrics } from '@/hooks/use-wrench-time';
import { useWrenchTimeTrend } from '@/hooks/use-wrench-time-trend';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';

export function MeuWrenchTimePage() {
  const codparc = useEffectiveCodparc();
  const [sp] = useSearchParams();
  const dataInicio = sp.get('de') ?? undefined;
  const dataFim = sp.get('ate') ?? undefined;

  const filterParams = useMemo(() => {
    const p: Record<string, string | number> = {};
    if (codparc) p.codparc = String(codparc);
    if (dataInicio) p.dataInicio = dataInicio;
    if (dataFim) p.dataFim = dataFim;
    return p;
  }, [codparc, dataInicio, dataFim]);

  const { metrics, isLoading, error } = useWrenchTimeMetrics(filterParams);
  const { trend, isLoading: trendLoading } = useWrenchTimeTrend(filterParams);

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

  if (!codparc) {
    return <Alert severity="warning">Usuario sem CODPARC vinculado</Alert>;
  }

  return (
    <>
      <ApiErrorBanner error={error} context="MeuWrenchTime" />

      <Stack spacing={1.5} sx={{ pb: { xs: 2, sm: 0 } }}>
        <WtKpiRow
          wrenchTimePercent={metrics?.wrenchTimePercent ?? null}
          totalProdMin={metrics?.totalProdMin ?? 0}
          totalLossMin={metrics?.totalLossMin ?? 0}
          topLossCategory={metrics?.topLossCategory ?? null}
          topLossMin={metrics?.topLossMin ?? 0}
          totalColaboradores={null}
          benchmarkStatus={metrics?.benchmarkStatus ?? null}
          overtimeMin={overtimeTotals.min}
          overtimeProdMin={overtimeTotals.prod}
          overtimeNonProdMin={overtimeTotals.nonProd}
          isLoading={isLoading}
        />

        <WtCategoryDonut
          breakdowns={metrics?.breakdowns ?? []}
          wrenchTimePercent={metrics?.wrenchTimePercent ?? 0}
          isLoading={isLoading}
        />

        <WtTopLosses
          breakdowns={metrics?.breakdowns ?? []}
          deductions={metrics?.deductions}
          dataInicio={dataInicio}
          dataFim={dataFim}
          isLoading={isLoading}
        />

        <WtDailySimple data={trend} isLoading={trendLoading} />

        {metrics && (
          <WtCalcDebug
            deductions={metrics.deductions}
            wrenchTimePercent={metrics.wrenchTimePercent}
            totalProdMin={metrics.totalProdMin}
            totalLossMin={metrics.totalLossMin}
          />
        )}
      </Stack>
    </>
  );
}

export default MeuWrenchTimePage;
