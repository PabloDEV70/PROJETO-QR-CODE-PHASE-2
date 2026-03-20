import { Box, Typography, useTheme } from '@mui/material';
import { ChartContainer } from '@/components/charts/chart-container';
import { BENCHMARK_ZONES, getAcademicBenchmarkZone } from '@/utils/wrench-time-academic';

interface WtGaugeProps {
  wrenchTimePercent: number;
  isLoading?: boolean;
}

const ARC_START = Math.PI;
const ARC_END = 0;
const CX = 150;
const CY = 140;
const R = 110;

function polarToCart(angle: number) {
  return { x: CX + R * Math.cos(angle), y: CY - R * Math.sin(angle) };
}

function describeArc(startPct: number, endPct: number) {
  const a1 = ARC_START - (startPct / 100) * Math.PI;
  const a2 = ARC_START - (endPct / 100) * Math.PI;
  const s = polarToCart(a1);
  const e = polarToCart(a2);
  const largeArc = Math.abs(a1 - a2) > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 0 ${e.x} ${e.y}`;
}

export function WtGauge({ wrenchTimePercent, isLoading }: WtGaugeProps) {
  const theme = useTheme();
  const zone = getAcademicBenchmarkZone(wrenchTimePercent);
  const pct = Math.min(100, Math.max(0, wrenchTimePercent));
  const needleAngle = ARC_START - (pct / 100) * (ARC_START - ARC_END);
  const tip = polarToCart(needleAngle);

  return (
    <ChartContainer title="Fator de Produtividade" height={200} isLoading={isLoading}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
        <svg viewBox="0 0 300 170" style={{ width: '100%', maxWidth: 300 }}>
          {BENCHMARK_ZONES.map((z) => (
            <path
              key={z.key} d={describeArc(z.min, z.max)}
              fill="none" stroke={z.color} strokeWidth={20} strokeLinecap="butt"
            />
          ))}
          <line
            x1={CX} y1={CY} x2={tip.x} y2={tip.y}
            stroke={theme.palette.text.primary} strokeWidth={3} strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={6} fill={theme.palette.text.primary} />
          <text x={CX} y={CY - 25} textAnchor="middle"
            fill={zone.color} fontSize={36} fontWeight={700}>
            {wrenchTimePercent}%
          </text>
        </svg>
        <Typography variant="body2" fontWeight={600} sx={{ color: zone.color, mt: -1 }}>
          {zone.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {zone.description}
        </Typography>
      </Box>
    </ChartContainer>
  );
}
