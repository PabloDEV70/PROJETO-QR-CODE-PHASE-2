import { Alert, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { AnalyticsFilterBar } from '@/components/analytics/analytics-filter-bar';
import { AssiduidadeTable } from '@/components/analytics/assiduidade-table';
import { useAnalyticsUrlParams } from '@/hooks/use-analytics-url-params';
import { useRdoFiltrosOpcoes } from '@/hooks/use-rdo-analytics';
import { useRdoAssiduidade } from '@/hooks/use-rdo-extra';

export function RdoAssiduidadePage() {
  const {
    dataInicio, dataFim, codparc, coddep,
    apiParams, updateParams, clearAll,
  } = useAnalyticsUrlParams();

  const assiduidade = useRdoAssiduidade(apiParams);
  const filtros = useRdoFiltrosOpcoes(apiParams);
  const meta = assiduidade.data?.meta;

  return (
    <PageLayout title="Assiduidade" icon={EventAvailable}>
      <AnalyticsFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep}
        onUpdateParams={updateParams} onClearAll={clearAll}
        filtrosOpcoes={filtros.data}
      />

      {assiduidade.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar assiduidade
        </Alert>
      )}

      <Stack spacing={3}>
        <Grid container spacing={2}>
          {[
            {
              label: 'Media Cumprimento',
              value: meta ? `${meta.mediaCumprimentoPercent.toFixed(1)}%` : '—',
            },
            {
              label: 'Media Atraso',
              value: meta ? `${meta.mediaAtrasoGeral.toFixed(0)} min` : '—',
            },
            {
              label: 'Total Colaboradores',
              value: meta ? String(meta.totalColaboradores) : '—',
            },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {assiduidade.isLoading ? (
                  <Skeleton variant="rectangular" height={60} />
                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {kpi.value}
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        <AssiduidadeTable
          data={assiduidade.data?.data}
          isLoading={assiduidade.isLoading}
        />
      </Stack>
    </PageLayout>
  );
}
