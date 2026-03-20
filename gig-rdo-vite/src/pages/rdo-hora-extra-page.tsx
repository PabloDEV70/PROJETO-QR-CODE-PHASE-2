import {
  Alert, Grid, Paper, Skeleton, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { PageLayout } from '@/components/layout/page-layout';
import { AnalyticsFilterBar } from '@/components/analytics/analytics-filter-bar';
import { HoraExtraTable } from '@/components/analytics/hora-extra-table';
import { useAnalyticsUrlParams } from '@/hooks/use-analytics-url-params';
import { useRdoFiltrosOpcoes } from '@/hooks/use-rdo-analytics';
import { useRdoHoraExtra } from '@/hooks/use-rdo-extra';

const fmtHrs = (min: number) => `${(min / 60).toFixed(1)}h`;

export function RdoHoraExtraPage() {
  const {
    dataInicio, dataFim, codparc, coddep,
    apiParams, updateParams, clearAll,
  } = useAnalyticsUrlParams();

  const horaExtra = useRdoHoraExtra(apiParams);
  const filtros = useRdoFiltrosOpcoes(apiParams);

  const totalHE = horaExtra.data?.meta.totalHoraExtraMin ?? 0;
  const totalColabs = horaExtra.data?.meta.totalColaboradores ?? 0;
  const mediaHE = totalColabs > 0 ? totalHE / totalColabs : 0;

  return (
    <PageLayout title="Hora Extra" icon={AccessTime}>
      <AnalyticsFilterBar
        dataInicio={dataInicio} dataFim={dataFim}
        codparc={codparc} coddep={coddep}
        onUpdateParams={updateParams} onClearAll={clearAll}
        filtrosOpcoes={filtros.data}
      />

      {horaExtra.error && (
        <Alert severity="error" sx={{ mb: 2 }}>Erro ao carregar hora extra</Alert>
      )}

      <Stack spacing={3}>
        <Grid container spacing={2}>
          {[
            { label: 'Total Hora Extra', value: fmtHrs(totalHE) },
            { label: 'Colaboradores com HE', value: String(totalColabs) },
            { label: 'Media por Colaborador', value: fmtHrs(mediaHE) },
          ].map((kpi) => (
            <Grid key={kpi.label} size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {horaExtra.isLoading ? (
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

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>Por Departamento</Typography>
            <HoraExtraTable
              data={horaExtra.data?.data.porDepartamento}
              isLoading={horaExtra.isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>Por Colaborador</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Colaborador</TableCell>
                    <TableCell>Dept.</TableCell>
                    <TableCell align="right">Total HE</TableCell>
                    <TableCell align="right">Dias c/ HE</TableCell>
                    <TableCell align="right">Media/dia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {horaExtra.isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : !horaExtra.data?.data.porColaborador.length ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Sem dados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    horaExtra.data.data.porColaborador.map((r) => (
                      <TableRow key={r.codparc} hover>
                        <TableCell>{r.nomeparc}</TableCell>
                        <TableCell>{r.departamento ?? 'Sem depto'}</TableCell>
                        <TableCell align="right">{fmtHrs(r.totalHoraExtraMin)}</TableCell>
                        <TableCell align="right">{r.diasComHoraExtra}</TableCell>
                        <TableCell align="right">{fmtHrs(r.mediaHoraExtraMinDia)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Stack>
    </PageLayout>
  );
}
