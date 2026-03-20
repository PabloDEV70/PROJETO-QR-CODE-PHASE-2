import { Box, Typography } from '@mui/material';
import { OS_STATUS_MAP, TIPO_MANUT_MAP, STATUSGIG_MAP } from '@/utils/os-constants';
import type { OsStatusCode } from '@/types/os-types';

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
      borderRadius: '4px', bgcolor: bg, color: fg,
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

export function OsStatusBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const def = OS_STATUS_MAP[status as OsStatusCode];
  if (!def) return null;
  return <Badge label={def.label} fg={def.fg} bg={def.bg} icon={def.icon} size={size} />;
}

export function TipoManutBadge({ tipo, size }: { tipo: string | null; size?: 'sm' | 'md' }) {
  if (!tipo) return null;
  const def = TIPO_MANUT_MAP[tipo];
  if (!def) return null;
  const isSm = size === 'sm';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: isSm ? 0.75 : 1, py: isSm ? 0.15 : 0.3,
      borderRadius: '4px',
      bgcolor: `${def.color}14`, color: def.color,
      lineHeight: 1,
    }}>
      {def.icon}
      <Typography sx={{
        fontSize: isSm ? 10 : 11.5, fontWeight: 600,
        letterSpacing: '-0.01em', lineHeight: 1,
      }}>
        {def.label}
      </Typography>
    </Box>
  );
}

export function StatusGigBadge({ statusGig }: { statusGig: string | null }) {
  if (!statusGig) return null;
  const def = STATUSGIG_MAP[statusGig];
  if (!def) return null;
  const color = def.impeditivo ? '#ef4444' : '#64748b';
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      px: 0.75, py: 0.15, borderRadius: '4px',
      bgcolor: `${color}14`, color,
      lineHeight: 1,
    }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>
        {def.label}
      </Typography>
    </Box>
  );
}
