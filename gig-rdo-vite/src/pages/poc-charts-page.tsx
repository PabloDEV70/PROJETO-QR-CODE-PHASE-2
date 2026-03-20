import { Alert, Stack } from '@mui/material';
import { Science } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { AnalyticsFilterBar } from '@/components/analytics/analytics-filter-bar';
import { PocChartSection } from '@/components/charts/poc-chart-section';
import { TimelineChart } from '@/components/charts/timeline-chart';
import { MotivosPieChart } from '@/components/charts/motivos-pie-chart';
import { ProdutividadeBarChart } from '@/components/charts/produtividade-bar-chart';
import { useAnalyticsUrlParams } from '@/hooks/use-analytics-url-params';
import {
  useRdoTimeline, useRdoMotivos, useRdoProdutividade, useRdoFiltrosOpcoes,
} from '@/hooks/use-rdo-analytics';

export function PocChartsPage() {
  const {
    dataInicio, dataFim, codparc, coddep,
    apiParams, updateParams, clearAll,
  } = useAnalyticsUrlParams();

  const timeline = useRdoTimeline(apiParams);
  const motivos = useRdoMotivos({ ...apiParams, limit: 10 });
  const produtividade = useRdoProdutividade({ ...apiParams, limit: 15 });
  const filtrosOpcoes = useRdoFiltrosOpcoes(apiParams);

  const hasError = timeline.error || motivos.error || produtividade.error;

  return (
    <PageLayout title="POC Charts" icon={Science}>
      <Stack spacing={2}>
        <AnalyticsFilterBar
          dataInicio={dataInicio} dataFim={dataFim}
          codparc={codparc} coddep={coddep}
          onUpdateParams={updateParams} onClearAll={clearAll}
          filtrosOpcoes={filtrosOpcoes.data}
        />

        {hasError && (
          <Alert severity="error">Erro ao carregar dados dos graficos</Alert>
        )}

        <PocChartSection
          title="Recharts"
          timeline={<TimelineChart data={timeline.data} isLoading={timeline.isLoading} />}
          pie={<MotivosPieChart data={motivos.data?.data} isLoading={motivos.isLoading} />}
          bar={<ProdutividadeBarChart data={produtividade.data} isLoading={produtividade.isLoading} />}
        />
      </Stack>
    </PageLayout>
  );
}
