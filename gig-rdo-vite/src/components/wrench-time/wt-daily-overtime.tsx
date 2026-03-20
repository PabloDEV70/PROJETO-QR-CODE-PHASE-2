import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { fmtMin } from '@/utils/wrench-time-categories';

interface TrendRow {
  date: string;
  label: string;
  overtimeMin: number;
  overtimeProdMin: number;
  overtimeNonProdMin: number;
}

interface Props {
  data: TrendRow[];
  isLoading?: boolean;
  onBarClick?: (date: string) => void;
}

const WEEKDAY_SIGLAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function WtDailyOvertime({ data, isLoading, onBarClick }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = useMemo(() => data
    .filter((r) => r.overtimeMin > 0)
    .map((r) => {
      const dt = new Date(r.date + 'T12:00:00');
      const sigla = WEEKDAY_SIGLAS[dt.getDay()];
      return {
        ...r,
        dayLabel: `${sigla} ${r.label}`,
        heHours: +(r.overtimeMin / 60).toFixed(1),
        prodHours: +(r.overtimeProdMin / 60).toFixed(1),
        nonProdHours: +(r.overtimeNonProdMin / 60).toFixed(1),
      };
    }), [data]);

  const totalHe = useMemo(
    () => data.reduce((s, r) => s + r.overtimeMin, 0),
    [data],
  );
  const diasComHe = chartData.length;

  if (!isLoading && data.length === 0) {
    return (
      <ChartContainer title="Hora Extra Diaria" height={250}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados para o periodo
          </Typography>
        </Stack>
      </ChartContainer>
    );
  }

  const renderTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: readonly { payload: (typeof chartData)[number] }[];
  }) => {
    if (!active || !payload?.length) return null;
    const r = payload[0]?.payload;
    if (!r) return null;
    return (
      <Stack sx={{
        bgcolor: 'background.paper', border: 1, borderColor: 'divider',
        borderRadius: 1, p: 1.5, minWidth: 180, boxShadow: 2,
      }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          {r.date.slice(8, 10)}/{r.date.slice(5, 7)}/{r.date.slice(0, 4)}
        </Typography>
        <Stack spacing={0.25}>
          <Row label="HE Total" value={fmtMin(r.overtimeMin)} color="#7C3AED" />
          <Row label="HE Produtiva" value={fmtMin(r.overtimeProdMin)} color="#16A34A" />
          <Row label="HE Improdutiva" value={fmtMin(r.overtimeNonProdMin)} color="#EF4444" />
        </Stack>
      </Stack>
    );
  };

  const barClick = onBarClick
    ? (_: unknown, idx: number) => {
      if (chartData[idx]) onBarClick(chartData[idx].date);
    }
    : undefined;

  return (
    <ChartContainer
      title="Hora Extra Diaria"
      subtitle={`Total: ${fmtMin(totalHe)} em ${diasComHe} dias`}
      height={isMobile ? 210 : 280}
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="dayLabel" interval={0} tick={{ fontSize: 9 }} />
          <YAxis
            tick={{ fontSize: 10 }} width={36}
            tickFormatter={(v: number) => `${v}h`}
          />
          <Tooltip
            content={renderTooltip}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="prodHours" name="HE Produtiva" stackId="he"
            fill="#16A34A" fillOpacity={0.75} maxBarSize={32}
            cursor={onBarClick ? 'pointer' : undefined} onClick={barClick}
          />
          <Bar
            dataKey="nonProdHours" name="HE Improdutiva" stackId="he"
            fill="#EF4444" fillOpacity={0.6} maxBarSize={32}
            radius={[3, 3, 0, 0]}
            cursor={onBarClick ? 'pointer' : undefined} onClick={barClick}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

function Row({ label, value, color }: {
  label: string; value: string; color: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="caption" sx={{ color }}>{label}:</Typography>
      <Typography variant="caption" fontWeight={600}>{value}</Typography>
    </Stack>
  );
}
