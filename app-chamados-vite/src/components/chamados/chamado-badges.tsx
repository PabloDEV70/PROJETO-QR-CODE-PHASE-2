import { Box, Typography } from '@mui/material';
import { STATUS_MAP, PRIO_MAP } from '@/utils/chamados-constants';
import type { ChamadoStatusCode, ChamadoPrioridadeCode } from '@/types/chamados-types';

interface BadgeProps {
  label: string;
  fg: string;
  bg: string;
  icon: React.ReactNode;
  size?: 'sm' | 'md';
}

function Badge({ label, fg, bg, icon, size = 'md' }: BadgeProps) {
  const isSm = size === 'sm';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: isSm ? 0.75 : 1, py: isSm ? 0.15 : 0.3,
      borderRadius: '6px', bgcolor: bg, color: fg,
      lineHeight: 1,
    }}>
      {icon}
      <Typography sx={{
        fontSize: isSm ? 10 : 11.5, fontWeight: 600,
        letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        {label}
      </Typography>
    </Box>
  );
}

export function StatusBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const def = STATUS_MAP[status as ChamadoStatusCode];
  if (!def) return null;
  return <Badge label={def.label} fg={def.fg} bg={def.bg} icon={def.icon} size={size} />;
}

export function PrioBadge({ prioridade, size }: { prioridade: string | null; size?: 'sm' | 'md' }) {
  if (!prioridade) return null;
  const def = PRIO_MAP[prioridade as ChamadoPrioridadeCode];
  if (!def) return null;
  return <Badge label={def.label} fg={def.fg} bg={def.bg} icon={def.icon} size={size} />;
}
