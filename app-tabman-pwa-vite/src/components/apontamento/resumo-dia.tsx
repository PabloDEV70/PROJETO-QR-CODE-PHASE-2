import { Box, LinearProgress, Typography, alpha } from '@mui/material';
import type { RdoMetricas } from '@/types/rdo-types';

interface ResumoDiaProps {
  metricas: RdoMetricas;
}

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h === 0 ? `${m}m` : `${h}h${String(m).padStart(2, '0')}`;
}

function barColor(pct: number): string {
  if (pct >= 80) return '#16a34a';
  if (pct >= 60) return '#f59e0b';
  return '#ef4444';
}

export function ResumoDia({ metricas }: ResumoDiaProps) {
  const pct = Math.round(metricas.produtividadePercent ?? 0);
  const color = barColor(pct);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Produtividade
        </Typography>
        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800, fontSize: '1.1rem', color, lineHeight: 1 }}>
          {pct}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        sx={{
          height: 6, borderRadius: 1,
          bgcolor: alpha(color, 0.12),
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 1 },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: 'success.main' }}>
          {fmtMin(metricas.minutosProdu ?? 0)} prod
        </Typography>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: 'text.disabled' }}>
          {fmtMin(metricas.minutosNaoProdu ?? 0)} pausas
        </Typography>
      </Box>
    </Box>
  );
}
