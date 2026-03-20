import { useMemo } from 'react';
import { Alert, Divider, Grid, Stack } from '@mui/material';
import { BarChart } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { AnalyticsFilterBar } from '@/components/analytics/analytics-filter-bar';
import { ComparativoCards } from '@/components/analytics/comparativo-cards';
import { RdoKpiCards } from '@/components/rdo/rdo-kpi-cards';
import { TimelineChart } from '@/components/charts/timeline-chart';
import { MotivosPieChart } from '@/components/charts/motivos-pie-chart';
import { ProdutividadeBarChart } from '@/components/charts/produtividade-bar-chart';
import { RdoMotivosTable } from '@/components/rdo/rdo-motivos-table';
import { ProdutividadeTable } from '@/components/analytics/produtividade-table';
import { ExportButton } from '@/components/shared/export-button';
import { useExport } from '@/hooks/use-export';
import { useAnalyticsUrlParams } from '@/hooks/use-analytics-url-params';
import { useRdoResumo } from '@/hooks/use-rdo';
import {
  useRdoProdutividade, useRdoMotivos, useRdoTimeline,
  useRdoComparativo, useRdoFiltrosOpcoes,
} from '@/hooks/use-rdo-analytics';
import type { ExportColumn } from '@/utils/excel-export';
import { ExcelFormats } from '@/utils/excel-formats';

const PROD_COLUMNS: ExportColumn[] = [
  { header: 'Colaborador', key: 'nomeparc', width: 30 },
  { header: 'RDOs', key: 'totalRdos', width: 10, numFmt: ExcelFormats.INTEGER },
  { header: 'Itens', key: 'totalItens', width: 10, numFmt: ExcelFormats.INTEGER },
  { header: 'Horas', key: 'totalHoras', width: 12, numFmt: ExcelFormats.DECIMAL_2 },
  { header: 'Media Min/Item', key: 'mediaMinutosPorItem', width: 14, numFmt: ExcelFormats.DECIMAL_2 },
  { header: '% Com OS', key: 'percentualComOs', width: 12, numFmt: ExcelFormats.PERCENTAGE_100 },
  { header: 'Departamento', key: 'departamento', width: 20 },
];

export function RdoAnalyticsPage() {
  const {
    dataInicio, dataFim, codparc, coddep,
    apiParams, updateParams, clearAll,
  } = useAnalyticsUrlParams();

  const resumo = useRdoResumo(apiParams);
  const produtividade = useRdoProdutividade({ ...apiParams, limit: 20 });
  const motivos = useRdoMotivos({ ...apiParams, limit: 15 });
  const timeline = useRdoTimeline(apiParams);
  const comparativo = useRdoComparativo(apiParams);
  const filtrosOpcoes = useRdoFiltrosOpcoes(apiParams);

  const prodData = produtividade.data;

  const exportConfig = useMemo(() => ({
    filename: 'Produtividade_RDO',
    sheetName: 'Produtividade',
    columns: PROD_COLUMNS,
    getData: () => (prodData ?? []) as unknown as Record<string, unknown>[],
    pdfHeader: {
      title: 'Produtividade por Colaborador',
      subtitle: `Periodo: ${dataInicio} a ${dataFim}`,
    },
    pdfOrientation: 'landscape' as const,
  }), [prodData, dataInicio, dataFim]);

  const { doExport, isExporting, error } = useExport(exportConfig);

  const hasError = resumo.error || produtividade.error || motivos.error;

  return (
    <PageLayout title="Analytics" icon={BarChart}>
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 0 }}>
        <AnalyticsFilterBar
          dataInicio={dataInicio} dataFim={dataFim}
          codparc={codparc} coddep={coddep}
          onUpdateParams={updateParams} onClearAll={clearAll}
          filtrosOpcoes={filtrosOpcoes.data}
        />
        <ExportButton
          onExport={doExport}
          isExporting={isExporting}
          error={error}
          disabled={!prodData || prodData.length === 0}
        />
      </Stack>

      {hasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar analytics
        </Alert>
      )}

      <Stack spacing={3}>
        <ComparativoCards data={comparativo.data} isLoading={comparativo.isLoading} />
        <RdoKpiCards resumo={resumo.data} isLoading={resumo.isLoading} />

        <Grid container spacing={3}>
          <Grid size={12}>
            <TimelineChart data={timeline.data} isLoading={timeline.isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <MotivosPieChart data={motivos.data?.data} isLoading={motivos.isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <ProdutividadeBarChart data={produtividade.data} isLoading={produtividade.isLoading} />
          </Grid>
          <Grid size={12}><Divider sx={{ my: 1 }} /></Grid>
          <Grid size={12}>
            <RdoMotivosTable motivos={motivos.data?.data} isLoading={motivos.isLoading} />
          </Grid>
          <Grid size={12}>
            <ProdutividadeTable data={produtividade.data} isLoading={produtividade.isLoading} />
          </Grid>
        </Grid>
      </Stack>
    </PageLayout>
  );
}
