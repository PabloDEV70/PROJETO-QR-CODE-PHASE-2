import {
  Drawer, Box, Typography, IconButton, Stack, Divider, Skeleton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import { useTendenciaTipoVeiculo } from '@/hooks/use-os-analise';
import type { OsAnaliseTipoVeiculo, OsTendenciaTipoVeiculo } from '@/types/os-analise-types';

interface OsAnaliseDrawerProps {
  open: boolean;
  onClose: () => void;
  row: OsAnaliseTipoVeiculo | null;
}

function fmtTempo(minutos: number | null): string {
  if (minutos == null) return '—';
  if (minutos < 60) return `${Math.round(minutos)} min`;
  if (minutos <= 1440) return `${(minutos / 60).toFixed(1)}h`;
  return `${(minutos / 1440).toFixed(1)} dias`;
}

function TrendTooltip({ active, payload }: {
  active?: boolean;
  payload?: readonly { payload: OsTendenciaTipoVeiculo }[];
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Stack sx={{
      bgcolor: 'background.paper', border: 1, borderColor: 'divider',
      borderRadius: 1, p: 1.5, boxShadow: 2, minWidth: 160,
    }} spacing={0.25}>
      <Typography variant="caption" fontWeight={600}>{d.mes}</Typography>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">OS:</Typography>
        <Typography variant="caption" fontWeight={600}>{d.totalOs}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">Media:</Typography>
        <Typography variant="caption" fontWeight={600}>
          {fmtTempo(d.mediaMinutos)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="caption" color="text.secondary">Execucoes:</Typography>
        <Typography variant="caption" fontWeight={600}>{d.totalExecucoes}</Typography>
      </Stack>
    </Stack>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value}</Typography>
    </Stack>
  );
}

export function OsAnaliseDrawer({ open, onClose, row }: OsAnaliseDrawerProps) {
  const { data: trend, isLoading } = useTendenciaTipoVeiculo(
    open && row ? row.tipoVeiculo : null,
  );

  const execPorOs = row && row.totalOs > 0
    ? (row.totalExecucoes / row.totalOs).toFixed(2)
    : '—';

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 420, p: 0 } }}>
      {row && (
        <>
          <Box sx={{
            p: 2.5, bgcolor: 'primary.main', color: 'primary.contrastText',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {row.tipoVeiculo}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {row.totalOs} OS | {row.veiculosDistintos} veiculos
                </Typography>
              </Box>
              <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
                <Close />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <ChartContainer
              title="Tendencia Mensal (12m)"
              height={240}
              isLoading={isLoading}
            >
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={trend}
                    margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'OS', angle: -90, position: 'insideLeft',
                        style: { fontSize: 10 },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v: number) =>
                        v < 60 ? `${v}m` : `${(v / 60).toFixed(0)}h`
                      }
                      label={{
                        value: 'Media', angle: 90, position: 'insideRight',
                        style: { fontSize: 10 },
                      }}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar
                      yAxisId="left"
                      dataKey="totalOs"
                      name="OS/mes"
                      fill="#3B82F6"
                      opacity={0.7}
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="mediaMinutos"
                      name="Media exec"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sem dados de tendencia
                  </Typography>
                </Stack>
              )}
            </ChartContainer>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Metricas
            </Typography>
            <MetricRow label="Media Execucao" value={fmtTempo(row.mediaMinutos)} />
            <MetricRow label="Total Execucoes" value={row.totalExecucoes.toLocaleString('pt-BR')} />
            <MetricRow label="Exec/OS" value={execPorOs} />
            <MetricRow label="Minimo" value={fmtTempo(row.minMinutos)} />
            <MetricRow label="Maximo" value={fmtTempo(row.maxMinutos)} />
          </Box>
        </>
      )}
      {!row && open && (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={240} />
        </Box>
      )}
    </Drawer>
  );
}
