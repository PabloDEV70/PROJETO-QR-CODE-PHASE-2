import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Grid, Stack } from '@mui/material';
import { ArrowBack, CalendarToday } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { RdoFilterBar } from '@/components/rdo/rdo-filter-bar';
import { RdoFilterDrawer } from '@/components/rdo/rdo-filter-drawer';
import { WtKpiRow } from '@/components/wrench-time/wt-kpi-row';
import { WtCategoryDonut } from '@/components/wrench-time/wt-category-donut';
import { WtTopLosses } from '@/components/wrench-time/wt-top-losses';
import { WtDiaColabTable } from '@/components/wrench-time/wt-dia-colab-table';
import { fmtBr, aggregateBreakdowns } from '@/components/wrench-time/wt-dia-helpers';
import { useRdoResumoAnalytics, useRdoTimeline } from '@/hooks/use-rdo-analytics';
import { useRdoDetalhesAll } from '@/hooks/use-rdo-extra';
import { useWrenchTimeByColab } from '@/hooks/use-wrench-time';
import { getProdBenchmarkStatus } from '@/utils/wrench-time-categories';
import type { RdoDetalhesParams } from '@/types/rdo-types';

type FilterParams = Omit<RdoDetalhesParams, 'page' | 'limit'>;

export function WrenchTimeDiaPage() {
  const { dtref } = useParams<{ dtref: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const coddep = searchParams.get('coddep');
  const codfuncao = searchParams.get('codfuncao');
  const codparc = searchParams.get('codparc');

  const filterParams = useMemo<FilterParams>(() => {
    const p: FilterParams = { dataInicio: dtref!, dataFim: dtref! };
    if (coddep) p.coddep = coddep;
    if (codfuncao) p.codfuncao = codfuncao;
    if (codparc) p.codparc = codparc;
    return p;
  }, [dtref, coddep, codfuncao, codparc]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newDate = updates.dataInicio ?? updates.dataFim;
      if (newDate && newDate !== dtref) {
        const qs = new URLSearchParams(searchParams);
        for (const [k, v] of Object.entries(updates)) {
          if (k === 'dataInicio' || k === 'dataFim') continue;
          if (v === null) qs.delete(k); else qs.set(k, v);
        }
        const s = qs.toString();
        navigate(`/wrench-time/dia/${newDate}${s ? `?${s}` : ''}`);
        return;
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(updates)) {
          if (k === 'dataInicio' || k === 'dataFim') continue;
          if (v === null) next.delete(k); else next.set(k, v);
        }
        return next;
      });
    },
    [dtref, searchParams, navigate, setSearchParams],
  );

  const clearAll = useCallback(() => setSearchParams({}), [setSearchParams]);

  const resumo = useRdoResumoAnalytics(filterParams as Record<string, string | number>);
  const timeline = useRdoTimeline(filterParams as Record<string, string | number>);
  const { colabs, isLoading, error } = useWrenchTimeByColab(filterParams);
  const rdoDetalhes = useRdoDetalhesAll({ ...filterParams, page: 1, limit: 100 });

  useEffect(() => {
    if (rdoDetalhes.error) {
      console.error('Erro ao carregar detalhes:', rdoDetalhes.error);
    }
  }, [rdoDetalhes.error]);

  const codrdoMap = useMemo(() => {
    const map = new Map<number, number[]>();
    if (!rdoDetalhes.data?.data) {
      return map;
    }

    for (const det of rdoDetalhes.data.data) {
      const codparcNum = det.CODPARC ? Number(det.CODPARC) : null;
      const codrdoNum = det.CODRDO ? Number(det.CODRDO) : null;

      if (codparcNum && codrdoNum) {
        const existing = map.get(codparcNum) ?? [];
        if (!existing.includes(codrdoNum)) {
          existing.push(codrdoNum);
        }
        map.set(codparcNum, existing);
      }
    }

    return map;
  }, [rdoDetalhes.data]);

  const dayBreakdowns = useMemo(() => aggregateBreakdowns(colabs), [colabs]);

  const dayMetrics = useMemo(() => {
    const totalMin = dayBreakdowns.reduce((s, b) => s + b.totalMin, 0);
    const prodMin = dayBreakdowns.find((b) => b.category === 'wrenchTime')?.totalMin ?? 0;
    const lossMin = totalMin - prodMin;
    const losses = dayBreakdowns.filter((b) => b.category !== 'wrenchTime' && b.totalMin > 0);
    const topLoss = losses.length > 0 ? losses[0]! : null;

    // Average backend produtividadePercent across collaborators
    const avgProd = colabs.length > 0
      ? Math.round(colabs.reduce((s, c) => s + c.produtividadePercent, 0) / colabs.length)
      : null;

    // Use timeline data (per-collaborator overtime) to match the daily chart exactly
    const tp = timeline.data?.[0];
    const overtimeMin = Number(tp?.minutosHoraExtra) || 0;
    const overtimeProdMin = Number(tp?.minutosHoraExtraProd) || 0;
    const overtimeNonProdMin = Number(tp?.minutosHoraExtraNaoProd) || 0;

    return {
      wrenchTimePercent: avgProd,
      totalProdMin: prodMin, totalLossMin: lossMin,
      topLossCategory: topLoss?.label ?? null,
      topLossMin: topLoss?.totalMin ?? 0,
      benchmarkStatus: avgProd != null ? getProdBenchmarkStatus(avgProd) : null,
      overtimeMin, overtimeProdMin, overtimeNonProdMin,
    };
  }, [dayBreakdowns, colabs, timeline.data]);

  if (!dtref) {
    return (
      <PageLayout title="Wrench Time" icon={CalendarToday}>
        <Alert severity="warning">Data nao informada</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`WT — ${fmtBr(dtref)}`}
      subtitle="Detalhamento do dia"
      icon={CalendarToday}
    >
      <RdoFilterBar
        dataInicio={dtref} dataFim={dtref}
        codparc={codparc} coddep={coddep} codfuncao={codfuncao}
        onUpdateParams={updateParams} onClearAll={clearAll}
        onOpenFilters={() => setDrawerOpen(true)}
        totalRegistros={resumo.data?.totalRdos}
        totalLabel="RDOs" isLoading={resumo.isLoading}
      />

      <Stack spacing={3} sx={{ mt: 2 }}>
        <Button
          startIcon={<ArrowBack />} variant="text" size="small"
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Voltar
        </Button>

        {error && <Alert severity="error">Erro ao carregar dados do dia</Alert>}

        <WtKpiRow
          wrenchTimePercent={dayMetrics.wrenchTimePercent}
          totalProdMin={dayMetrics.totalProdMin}
          totalLossMin={dayMetrics.totalLossMin}
          topLossCategory={dayMetrics.topLossCategory}
          topLossMin={dayMetrics.topLossMin}
          totalColaboradores={resumo.data?.totalColaboradores ?? null}
          benchmarkStatus={dayMetrics.benchmarkStatus}
          overtimeMin={dayMetrics.overtimeMin}
          overtimeProdMin={dayMetrics.overtimeProdMin}
          overtimeNonProdMin={dayMetrics.overtimeNonProdMin}
          isLoading={isLoading}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <WtCategoryDonut
              breakdowns={dayBreakdowns}
              wrenchTimePercent={dayMetrics.wrenchTimePercent ?? 0}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <WtTopLosses breakdowns={dayBreakdowns} isLoading={isLoading} />
          </Grid>
        </Grid>

        <WtDiaColabTable
          colabs={colabs} dayBreakdowns={dayBreakdowns} dtref={dtref} isLoading={isLoading}
          codrdoMap={codrdoMap}
        />
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

export default WrenchTimeDiaPage;
