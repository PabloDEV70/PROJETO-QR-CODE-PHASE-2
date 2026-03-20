import { useState } from 'react';
import {
  ToggleButtonGroup, ToggleButton, Stack, Typography,
  Chip, useTheme, useMediaQuery,
} from '@mui/material';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import { useEvolutionData, type ChartRow } from '@/hooks/use-evolution-data';
import type { RdoTimelinePoint } from '@/types/rdo-types';

type Metric = 'horas' | 'rdos' | 'itens';
type Agrupamento = 'diario' | 'semanal';

const METRICS: Record<Metric, { label: string; color: string; unit: string }> = {
  horas: { label: 'Horas', color: '#3B82F6', unit: 'h' },
  rdos: { label: 'RDOs', color: '#8B5CF6', unit: '' },
  itens: { label: 'Apontamentos', color: '#F59E0B', unit: '' },
};

interface Props {
  data?: RdoTimelinePoint[];
  isLoading?: boolean;
}

export function RdoEvolutionChart({ data, isLoading }: Props) {
  const [metric, setMetric] = useState<Metric>('horas');
  const [agrup, setAgrup] = useState<Agrupamento>('diario');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const m = METRICS[metric];

  const { chartData, trend } = useEvolutionData(data, metric, agrup, isMobile);

  return (
    <ChartContainer
      title="Evolucao no Periodo"
      subtitle={`${chartData.length} ${agrup === 'semanal' ? 'semanas' : 'dias'} com dados`}
      height={isMobile ? 220 : 260}
      isLoading={isLoading}
      action={
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {trend && (
            <Chip
              size="small"
              label={`${trend.up ? '+' : ''}${trend.pct}% ${trend.label}`}
              sx={{
                height: 22, fontSize: 11, fontWeight: 700,
                bgcolor: trend.up ? 'rgba(22,163,74,0.1)' : 'rgba(211,47,47,0.1)',
                color: trend.up ? '#16A34A' : '#d32f2f',
              }}
            />
          )}
          <ToggleButtonGroup
            value={agrup} exclusive size="small"
            onChange={(_, v: Agrupamento | null) => { if (v) setAgrup(v); }}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1, py: 0.25, fontSize: 11 } }}
          >
            <ToggleButton value="diario">Diario</ToggleButton>
            <ToggleButton value="semanal">Semanal</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={metric} exclusive size="small"
            onChange={(_, v: Metric | null) => { if (v) setMetric(v); }}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1, py: 0.25, fontSize: 11 } }}
          >
            <ToggleButton value="horas">Horas</ToggleButton>
            <ToggleButton value="rdos">RDOs</ToggleButton>
            <ToggleButton value="itens">Itens</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`bar-grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={m.color} stopOpacity={0.85} />
              <stop offset="100%" stopColor={m.color} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickMargin={4} />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as ChartRow | undefined;
              if (!row) return null;
              return (
                <Stack sx={{
                  p: 1.5, borderRadius: 2,
                  bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                  boxShadow: 4, minWidth: 160,
                }}>
                  <Typography variant="caption" fontWeight={700}>{row.tooltip}</Typography>
                  <Typography variant="body2" sx={{ color: m.color, fontWeight: 700, mt: 0.5 }}>
                    {row.valor}{m.unit}
                  </Typography>
                  {row.media != null && (
                    <Typography variant="caption" color="text.secondary">
                      Media movel: {row.media}{m.unit}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {row.colabs} colaboradores
                  </Typography>
                </Stack>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="valor" name={m.label}
            fill={`url(#bar-grad-${metric})`}
            radius={[4, 4, 0, 0]} maxBarSize={40}
          />
          <Line
            dataKey="media" name="Media movel"
            stroke="#EC4899" strokeWidth={2} strokeDasharray="5 3"
            dot={false} connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
