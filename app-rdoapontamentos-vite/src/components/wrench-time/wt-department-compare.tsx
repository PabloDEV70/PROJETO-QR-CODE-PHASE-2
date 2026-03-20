import { useMemo } from 'react';
import { Typography, Stack, useTheme } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChartContainer } from '@/components/charts/chart-container';
import { WRENCH_TIME_CATEGORIES, fmtMin } from '@/utils/wrench-time-categories';
import type { ColaboradorWrenchTime } from '@/types/wrench-time-types';

interface WtDepartmentCompareProps {
  colabs: ColaboradorWrenchTime[];
  isLoading?: boolean;
}

interface DepartmentData { name: string; [key: string]: string | number; }

const fmtHours = (min: number): string => `${(min / 60).toFixed(1)}h`;

export function WtDepartmentCompare({ colabs, isLoading }: WtDepartmentCompareProps) {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!colabs || colabs.length === 0) return [];
    const deptMap = new Map<string, DepartmentData>();

    colabs.forEach((colab) => {
      const dept = colab.departamento || 'Sem Departamento';
      if (!deptMap.has(dept)) {
        const init: DepartmentData = { name: dept };
        for (const cat of WRENCH_TIME_CATEGORIES) init[cat.key] = 0;
        deptMap.set(dept, init);
      }
      const deptData = deptMap.get(dept)!;
      colab.categoryBreakdown.forEach((cat) => {
        deptData[cat.category] = (Number(deptData[cat.category]) || 0) + cat.totalMin;
      });
    });

    return Array.from(deptMap.values()).sort((a, b) => {
      const sumA = WRENCH_TIME_CATEGORIES.reduce((s, c) => s + (Number(a[c.key]) || 0), 0);
      const sumB = WRENCH_TIME_CATEGORIES.reduce((s, c) => s + (Number(b[c.key]) || 0), 0);
      return sumB - sumA;
    });
  }, [colabs]);

  const chartHeight = useMemo(() => {
    const calculated = Math.max(200, chartData.length * 40);
    return Math.min(calculated, 400);
  }, [chartData.length]);

  if (isLoading) {
    return (
      <ChartContainer title="Comparativo por Departamento" height={300}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
          <Typography variant="body2" color="text.secondary">Carregando...</Typography>
        </Stack>
      </ChartContainer>
    );
  }

  if (chartData.length === 0) {
    return (
      <ChartContainer title="Comparativo por Departamento" height={300}>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 250 }}>
          <Typography variant="body2" color="text.secondary">Sem dados</Typography>
        </Stack>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Comparativo por Departamento" height={chartHeight + 100}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={chartData} layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis type="number" tickFormatter={fmtHours}
            stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={120}
            stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const data = payload[0]!.payload as DepartmentData;
            const total = payload.reduce((s, e) => s + (Number(e.value) || 0), 0);
            return (
              <Stack sx={{
                bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                borderRadius: 1, p: 1.5, minWidth: 200,
              }} spacing={0.5}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{data.name}</Typography>
                {payload.map((entry) => {
                  const val = Number(entry.value) || 0;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                  return (
                    <Stack key={entry.dataKey} direction="row"
                      justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <div style={{
                          width: 12, height: 12, backgroundColor: entry.color as string,
                          borderRadius: 2,
                        }} />
                        <Typography variant="body2">{entry.name}:</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="medium">
                        {fmtMin(val)} ({pct}%)
                      </Typography>
                    </Stack>
                  );
                })}
                <Stack direction="row" justifyContent="space-between"
                  sx={{ mt: 0.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight="bold">Total:</Typography>
                  <Typography variant="body2" fontWeight="bold">{fmtMin(total)}</Typography>
                </Stack>
              </Stack>
            );
          }} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="rect" iconSize={12} />
          {WRENCH_TIME_CATEGORIES.map((cat) => (
            <Bar key={cat.key} dataKey={cat.key} name={cat.label}
              fill={cat.color} stackId="stack" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
