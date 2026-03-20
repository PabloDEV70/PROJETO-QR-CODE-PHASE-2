import { Box, Typography } from '@mui/material';
import {
  HourglassBottomRounded, SupportAgentRounded, PauseCircleRounded,
  ScheduleRounded, CheckCircleRounded, CancelRounded,
  FlagRounded, RemoveCircleOutlineRounded,
} from '@mui/icons-material';

interface BadgeStyle {
  label: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
}

const I = { fontSize: '13px !important' };

const STATUS_STYLES: Record<string, BadgeStyle> = {
  P: {
    label: 'Pendente', fg: '#b45309', bg: '#fef3c7',
    icon: <HourglassBottomRounded sx={I} />,
  },
  E: {
    label: 'Em Atendimento', fg: '#0369a1', bg: '#e0f2fe',
    icon: <SupportAgentRounded sx={I} />,
  },
  S: {
    label: 'Suspenso', fg: '#475569', bg: '#f1f5f9',
    icon: <PauseCircleRounded sx={I} />,
  },
  A: {
    label: 'Aguardando', fg: '#7c3aed', bg: '#ede9fe',
    icon: <ScheduleRounded sx={I} />,
  },
  F: {
    label: 'Finalizado', fg: '#15803d', bg: '#dcfce7',
    icon: <CheckCircleRounded sx={I} />,
  },
  C: {
    label: 'Cancelado', fg: '#b91c1c', bg: '#fee2e2',
    icon: <CancelRounded sx={I} />,
  },
};

const PRIO_STYLES: Record<string, BadgeStyle> = {
  A: {
    label: 'Alta', fg: '#dc2626', bg: '#fef2f2',
    icon: <FlagRounded sx={I} />,
  },
  M: {
    label: 'Media', fg: '#d97706', bg: '#fffbeb',
    icon: <FlagRounded sx={I} />,
  },
  B: {
    label: 'Baixa', fg: '#16a34a', bg: '#f0fdf4',
    icon: <RemoveCircleOutlineRounded sx={I} />,
  },
};

interface BadgeProps {
  style: BadgeStyle;
  size?: 'sm' | 'md';
}

function Badge({ style, size = 'md' }: BadgeProps) {
  const isSm = size === 'sm';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: isSm ? 0.75 : 1, py: isSm ? 0.15 : 0.3,
      borderRadius: '6px', bgcolor: style.bg, color: style.fg,
      lineHeight: 1,
    }}>
      {style.icon}
      <Typography sx={{
        fontSize: isSm ? 10 : 11.5, fontWeight: 600,
        letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        {style.label}
      </Typography>
    </Box>
  );
}

export function StatusBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const style = STATUS_STYLES[status];
  if (!style) return null;
  return <Badge style={style} size={size} />;
}

export function PrioBadge({ prioridade, size }: { prioridade: string | null; size?: 'sm' | 'md' }) {
  if (!prioridade) return null;
  const style = PRIO_STYLES[prioridade];
  if (!style) return null;
  return <Badge style={style} size={size} />;
}

export { STATUS_STYLES, PRIO_STYLES };
