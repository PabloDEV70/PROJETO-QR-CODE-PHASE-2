import { useMemo, useState } from 'react';
import { Alert, Grid, Paper, Stack, Typography, Button } from '@mui/material';
import { Category, Print } from '@mui/icons-material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { PageLayout } from '@/components/layout/page-layout';
import { AnalyticsFilterBar } from '@/components/analytics/analytics-filter-bar';
import { MotivosPieChart } from '@/components/charts/motivos-pie-chart';
import { RdoMotivosTable } from '@/components/rdo/rdo-motivos-table';
import { ChartContainer } from '@/components/charts/chart-container';
import { useAnalyticsUrlParams } from '@/hooks/use-analytics-url-params';
import { useRdoMotivos, useRdoFiltrosOpcoes } from '@/hooks/use-rdo-analytics';
import { useMotivos } from '@/hooks/use-motivos';
import { printMotivosBatch } from '@/components/rdo/motivo-batch-print';

export function RdoMotivosPage() {
  const {
    dataInicio, dataFim, codparc, coddep,
    apiParams, updateParams, clearAll,
  } = useAnalyticsUrlParams();

  const motivos = useRdoMotivos(apiParams);
  const filtros = useRdoFiltrosOpcoes(apiParams);
  const [printing, setPrinting] = useState(false);

  const allMotivos = useMotivos({ ativo: 'S', limit: 500 });

  const handlePrint = () => {
    if (!allMotivos.data?.length) return;
    setPrinting(true);
    printMotivosBatch(allMotivos.data, { columns: 2 });
    setPrinting(false);
  };

  const motivosList = motivos.data?.data;

  const kpis = useMemo(() => {
    if (!motivosList?.length) {
      return { totalMotivos: 0, totalHoras: 0, totalApontamentos: 0 };
    }
    return {
      totalMotivos: motivosList.length,
      totalHoras: motivosList.reduce((s, m) => s + m.totalHoras, 0),
      totalApontamentos: motivosList.reduce((s, m) => s + m.totalItens, 0),
    };
  }, [motivosList]);

  const barData = useMemo(() => {
    if (!motivosList?.length) return [];
    return motivosList.slice(0, 10).map((m) => ({
      name: m.sigla || m.descricao.substring(0, 15),
      horas: Number(m.totalHoras.toFixed(1)),
    }));
  }, [motivosList]);

  return (
    <PageLayout title="Motivos" icon={Category}>
      <AnalyticsFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep}
        onUpdateParams={updateParams} onClearAll={clearAll}
        filtrosOpcoes={filtros.data}
      />

      {motivos.error && (
        <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar motivos</Alert>
      )}

      <Stack spacing={3}>
        <Grid container spacing={2}>
          {[
            { label: 'Total Motivos', value: String(kpis.totalMotivos) },
            { label: 'Total Horas', value: `${kpis.totalHoras.toFixed(1)}h` },
            { label: 'Total Apontamentos', value: kpis.totalApontamentos.toLocaleString('pt-BR') },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {kpi.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">{kpi.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <MotivosPieChart data={motivosList} isLoading={motivos.isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <ChartContainer
              title="Top Motivos por Horas"
              subtitle="Ranking de horas totais"
              isLoading={motivos.isLoading}
              height={280}
            >
              <ResponsiveContainer>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}h`} />
                  <Bar dataKey="horas" fill="#1976d2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Grid>
        </Grid>

        <RdoMotivosTable motivos={motivosList} isLoading={motivos.isLoading} />

        <Paper sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
            disabled={printing || !allMotivos.data?.length}
          >
            Imprimir Etiquetas ({allMotivos.data?.length || 0})
          </Button>
        </Paper>
      </Stack>
    </PageLayout>
  );
}
