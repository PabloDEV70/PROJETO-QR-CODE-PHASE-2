import { Grid, Stack } from '@mui/material';
import { RdoKpiCards } from '@/components/rdo/rdo-kpi-cards';
import { RdoMetaGauge } from '@/components/rdo/rdo-meta-gauge';
import { RdoMotivoTreemap } from '@/components/rdo/rdo-motivo-treemap';
import { RdoColaboradorRanking } from '@/components/rdo/rdo-colaborador-ranking';
import { RdoMetaHistorico } from '@/components/rdo/rdo-meta-historico';
import { RdoHeatmapSemanal } from '@/components/rdo/rdo-heatmap-semanal';
import { RdoEquipeHistograma } from '@/components/rdo/rdo-equipe-histograma';
import { RdoEvolutionChart } from '@/components/rdo/rdo-evolution-chart';
import { RdoProdutividadeTrend } from '@/components/rdo/rdo-produtividade-trend';
import { RdoTrendInsights } from '@/components/rdo/rdo-trend-insights';
import type { MotivoGroup } from '@/components/rdo/rdo-motivo-treemap';
import type { DashboardData } from '@/hooks/use-rdo-dashboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

export interface RdoListDashboardProps {
  dashboard: DashboardData | null | undefined;
  resumo: AnyData;
  comparativo: AnyData;
  timeline: AnyData;
  produtividade: AnyData;
  treemapGroups: MotivoGroup[];
  treemapTotal: number;
  hasExcedentes: boolean;
  horasEspAjustadas: number | undefined;
  totalDias: number | undefined;
  dataInicio: string | null;
  dataFim: string | null;
  configMode: string;
  isLoadingResumo: boolean;
  isLoadingMotivos: boolean;
  isLoadingTimeline: boolean;
  isLoadingProdutividade: boolean;
  onMotivoClick: (cod: number | null) => void;
  onColaboradorClick: (codparc: number) => void;
}

export function RdoListDashboard(p: RdoListDashboardProps) {
  return (
    <>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 3 }}>
          <RdoMetaGauge productivity={p.dashboard?.productivity}
            isLoading={p.isLoadingResumo} />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <RdoKpiCards
            resumo={p.resumo} comparativo={p.comparativo}
            isLoading={p.isLoadingResumo}
            motivoGroups={p.treemapGroups} motivoTotalMin={p.treemapTotal}
            dataInicio={p.dataInicio ?? undefined} dataFim={p.dataFim ?? undefined}
            produtividadePercent={p.dashboard?.productivity.produtividadePercent}
            configMode={p.configMode}
            motivosProdutivos={p.dashboard?.productivity.motivosProdutivos}
            totalProdMin={p.dashboard?.productivity.totalProdMin}
            totalNaoProdMin={p.dashboard?.productivity.totalNaoProdMin}
            totalMinutosPrevistos={p.resumo?.totalMinutosPrevistos}
            totalMetaEfetivaMin={p.dashboard?.productivity.totalMetaEfetivaMin}
            totalToleranciaDeducaoMin={p.dashboard?.productivity.totalToleranciaDeducaoMin}
            prodVsMetaPercent={p.dashboard?.productivity.prodVsMetaPercent}
            timeline={p.timeline}
          />
        </Grid>
      </Grid>
      {p.treemapGroups.length > 0 && (
        <RdoMotivoTreemap
          groups={p.treemapGroups} totalMin={p.treemapTotal}
          isLoading={p.isLoadingMotivos}
          onMotivoClick={p.onMotivoClick}
          hasExcedentes={p.hasExcedentes} rawTotalMin={p.dashboard?.rawTotalMin}
          totalDias={p.totalDias}
          horasEsperadas={p.horasEspAjustadas}
        />
      )}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <RdoColaboradorRanking produtividade={p.produtividade}
            isLoading={p.isLoadingProdutividade}
            onColaboradorClick={p.onColaboradorClick} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <RdoHeatmapSemanal timeline={p.timeline} isLoading={p.isLoadingTimeline} />
            <RdoEquipeHistograma produtividade={p.produtividade}
              isLoading={p.isLoadingProdutividade} />
          </Stack>
        </Grid>
      </Grid>
      <RdoMetaHistorico timeline={p.timeline}
        mediaHorasDia={p.resumo?.mediaHorasDia}
        isLoading={p.isLoadingTimeline} />
      <RdoEvolutionChart data={p.timeline} isLoading={p.isLoadingTimeline} />
      <RdoProdutividadeTrend data={p.timeline} isLoading={p.isLoadingTimeline}
        produtividadePercent={p.dashboard?.productivity.produtividadePercent} />
      <RdoTrendInsights
        groups={p.treemapGroups} totalMin={p.treemapTotal}
        comparativo={p.comparativo} timeline={p.timeline}
        isLoading={p.isLoadingMotivos} configMode={p.configMode}
      />
    </>
  );
}
