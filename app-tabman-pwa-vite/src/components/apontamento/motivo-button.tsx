import { Paper, Typography } from '@mui/material';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoMotivo } from '@/types/rdo-types';

interface MotivoButtonProps {
  motivo: RdoMotivo;
  onPick: (motivo: RdoMotivo) => void;
  disabled?: boolean;
}

function getCatColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16a34a';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

export function MotivoButton({ motivo, onPick, disabled }: MotivoButtonProps) {
  const isProd = motivo.PRODUTIVO === 'S';
  const color = getCatColor(motivo);

  return (
    <Paper
      elevation={0}
      onClick={() => !disabled && onPick(motivo)}
      sx={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        py: 1.25,
        px: 1,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: color,
        color: '#fff',
        overflow: 'hidden',
        border: 'none',
        transition: 'transform 0.1s, filter 0.1s',
        '&:active': { transform: 'scale(0.95)', filter: 'brightness(0.85)' },
        ...(isProd && { gridColumn: 'span 3' }),
      }}
    >
      <Typography sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: isProd ? '2rem' : '1.15rem',
        fontWeight: 800,
        lineHeight: 1,
      }}>
        {motivo.RDOMOTIVOCOD}
      </Typography>
      <Typography sx={{
        fontSize: isProd ? '0.75rem' : '0.65rem',
        fontWeight: 700,
        lineHeight: 1,
        mt: 0.4,
      }}>
        {motivo.SIGLA}
      </Typography>
      <Typography sx={{
        fontSize: isProd ? '0.58rem' : '0.52rem',
        lineHeight: 1.2,
        opacity: 0.8,
        mt: 0.3,
        textAlign: 'center',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {motivo.DESCRICAO}
      </Typography>
    </Paper>
  );
}
