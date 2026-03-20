import { useMemo } from 'react';
import { Paper, Typography, Skeleton, Stack, Chip, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RdoAnalyticsProdutividade } from '@/types/rdo-analytics-types';

interface Props {
  produtividade?: RdoAnalyticsProdutividade[];
  isLoading: boolean;
}

interface Bucket {
  faixa: string; count: number; color: string; colabs: string[];
}

const FAIXAS = [
  { min: 0, max: 3, label: '0-3h', color: '#d32f2f' },
  { min: 3, max: 5, label: '3-5h', color: '#F59E0B' },
  { min: 5, max: 7, label: '5-7h', color: '#FB8C00' },
  { min: 7, max: 9, label: '7-9h', color: '#16A34A' },
  { min: 9, max: Infinity, label: '9h+', color: '#1565C0' },
];

export function RdoEquipeHistograma({ produtividade, isLoading }: Props) {
  const theme = useTheme();

  const buckets = useMemo((): Bucket[] => {
    if (!produtividade?.length) return [];
    return FAIXAS.map((f) => {
      const inRange = produtividade.filter(
        (p) => p.totalHoras >= f.min && p.totalHoras < f.max,
      );
      return {
        faixa: f.label, count: inRange.length, color: f.color,
        colabs: inRange.map((p) => p.nomeparc),
      };
    });
  }, [produtividade]);

  if (isLoading) {
    return <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2.5 }} />;
  }
  if (buckets.length === 0 || !produtividade?.length) return null;

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  const lowCount = buckets.filter((b) => b.faixa === '0-3h' || b.faixa === '3-5h')
    .reduce((s, b) => s + b.count, 0);

  return (
    <Paper sx={{ p: 2.5, borderRadius: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Distribuicao da Equipe ({produtividade.length})
        </Typography>
        {lowCount > 0 && (
          <Chip size="small" label={`${lowCount} abaixo de 5h`} color="warning"
            variant="outlined" sx={{ height: 22, fontSize: 11 }} />
        )}
      </Stack>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={buckets} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}
            stroke={theme.palette.divider} />
          <XAxis type="number" domain={[0, maxCount + 1]}
            tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="faixa" width={40}
            tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v, _, entry) => {
              const n = Number(v ?? 0);
              const b = (entry as { payload: Bucket }).payload;
              const names = b.colabs.slice(0, 5).join(', ');
              const extra = b.colabs.length > 5 ? ` +${b.colabs.length - 5}` : '';
              return [`${n} colaborador${n > 1 ? 'es' : ''}: ${names}${extra}`, 'Qtd'];
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {buckets.map((b, i) => (
              <Cell key={i} fill={b.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
