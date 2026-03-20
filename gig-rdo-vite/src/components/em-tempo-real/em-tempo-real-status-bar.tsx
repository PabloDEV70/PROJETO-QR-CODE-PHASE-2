import { Box, Typography, Paper } from '@mui/material';
import type { EmTempoRealResumo } from '@/types/em-tempo-real-types';

interface BarSegment {
  label: string;
  value: number;
  color: string;
}

interface EmTempoRealStatusBarProps {
  resumo: EmTempoRealResumo | undefined;
}

export function EmTempoRealStatusBar({ resumo }: EmTempoRealStatusBarProps) {
  if (!resumo || resumo.total === 0) return null;

  const statusSegments: BarSegment[] = [
    { label: 'Atendimento', value: resumo.atendimento, color: '#1976d2' },
    { label: 'Liberada', value: resumo.liberada, color: '#2e7d32' },
    { label: 'Pendente', value: resumo.pendente, color: '#ed6c02' },
  ];

  const estoqueSegments: BarSegment[] = [
    { label: 'Baixa', value: resumo.baixa_estoque, color: '#d32f2f' },
    { label: 'Entrada', value: resumo.entrada_estoque, color: '#2e7d32' },
    { label: 'Sem Mov.', value: resumo.sem_movimentacao, color: '#757575' },
    { label: 'Reserva', value: resumo.reserva_estoque, color: '#9c27b0' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <SegmentBar title="Por Status" segments={statusSegments} total={resumo.total} />
      <SegmentBar title="Por Estoque" segments={estoqueSegments} total={resumo.total} />
    </Box>
  );
}

function SegmentBar({
  title,
  segments,
  total,
}: {
  title: string;
  segments: BarSegment[];
  total: number;
}) {
  return (
    <Paper sx={{ p: 2, flex: '1 1 300px', minWidth: 300 }} elevation={1}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', height: 20, borderRadius: 1, overflow: 'hidden' }}>
        {segments.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <Box
              key={s.label}
              sx={{
                width: `${pct}%`,
                bgcolor: s.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: pct > 8 ? 40 : 0,
                transition: 'width 0.5s ease',
              }}
            >
              {pct > 8 && (
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                  {s.value}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        {segments.map((s) => (
          <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color }}
            />
            <Typography variant="caption" color="text.secondary">
              {s.label}: {s.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
