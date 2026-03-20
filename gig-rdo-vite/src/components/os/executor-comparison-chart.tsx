import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ExecutorRankingRow } from '@/types/executor-ranking-types';

interface ExecutorComparisonChartProps {
  data: ExecutorRankingRow[] | undefined;
  isLoading: boolean;
}

interface ChartData {
  nome: string;
  taxaConclusao: number;
  tempoMedioMin: number;
}

function truncateName(name: string, maxLength = 15): string {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength - 1)}…`;
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <Paper elevation={3} sx={{ p: 1.5, minWidth: 180 }}>
      <Stack spacing={0.5}>
        {payload.map((entry) => (
          <Stack key={entry.name} direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" fontWeight={600} color={entry.color}>
              {entry.name}
            </Typography>
            <Typography variant="body2">
              {entry.name === 'Taxa Conclusao'
                ? `${entry.value.toFixed(1)}%`
                : `${entry.value.toFixed(0)} min`}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export function ExecutorComparisonChart({ data, isLoading }: ExecutorComparisonChartProps) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Carregando...
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Nenhum executor encontrado no periodo
        </Typography>
      </Paper>
    );
  }

  const top10 = data.slice(0, 10);

  const chartData: ChartData[] = top10.map((row) => ({
    nome: truncateName(row.nomeExecutor),
    taxaConclusao: row.taxaConclusao ?? 0,
    tempoMedioMin: row.tempoMedioMin ?? 0,
  }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Comparativo Top 10 Executores
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="taxaConclusao"
              name="Taxa Conclusao"
              fill={theme.palette.primary.main}
            />
            <Bar
              dataKey="tempoMedioMin"
              name="Tempo Medio (min)"
              fill={theme.palette.secondary.main}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
