import { Box, Stack, Typography, useTheme } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { BENCHMARK_ZONES, getAcademicBenchmarkZone } from '@/utils/wrench-time-academic';

interface WtBenchmarkBarProps {
  wrenchTimePercent: number;
  isLoading?: boolean;
}

export function WtBenchmarkBar({ wrenchTimePercent, isLoading }: WtBenchmarkBarProps) {
  const theme = useTheme();
  const activeZone = getAcademicBenchmarkZone(wrenchTimePercent);
  const pct = Math.min(100, Math.max(0, wrenchTimePercent));

  return (
    <ChartContainer
      title="Posicao no Benchmark Internacional"
      subtitle="Baseado em estudos academicos (FINOM, ENGETELES, TRACTIAN)"
      height={200} isLoading={isLoading}
    >
      <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', width: '100%', height: 40 }}>
          <Stack direction="row" sx={{ height: '100%', borderRadius: 1, overflow: 'hidden' }}>
            {BENCHMARK_ZONES.map((z) => (
              <Box
                key={z.key}
                sx={{
                  width: `${z.max - z.min}%`, bgcolor: z.color,
                  opacity: z.key === activeZone.key ? 1 : 0.35,
                  transition: 'opacity 0.3s',
                }}
              />
            ))}
          </Stack>
          <Box sx={{
            position: 'absolute', top: -8, left: `${pct}%`, transform: 'translateX(-50%)',
          }}>
            <Box sx={{
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `10px solid ${theme.palette.text.primary}`,
            }} />
          </Box>
          <Box sx={{
            position: 'absolute', bottom: -6, left: `${pct}%`, transform: 'translateX(-50%)',
          }}>
            <Box sx={{
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: `10px solid ${theme.palette.text.primary}`,
            }} />
          </Box>
        </Box>

        <Stack direction="row" sx={{ width: '100%' }}>
          {BENCHMARK_ZONES.map((z) => (
            <Box key={z.key} sx={{ width: `${z.max - z.min}%`, textAlign: 'center' }}>
              <Typography
                variant="caption"
                fontWeight={z.key === activeZone.key ? 700 : 400}
                sx={{ color: z.key === activeZone.key ? z.color : 'text.secondary' }}
              >
                {z.label}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" fontSize={10}>
                {z.min}-{z.max}%
              </Typography>
            </Box>
          ))}
        </Stack>

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Seu FP: <strong style={{ color: activeZone.color }}>{wrenchTimePercent}%</strong>
          {' — '}{activeZone.description}
        </Typography>
      </Stack>
    </ChartContainer>
  );
}
