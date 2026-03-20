import { Box, Typography, Skeleton, alpha } from '@mui/material';
import { Build, DirectionsCar } from '@mui/icons-material';
import { getOsStatusColor } from '@/utils/os-status-colors';
import { useMinhasOs } from '@/hooks/use-minhas-os';
import type { OsListItem } from '@/types/os-types';

interface OsListInlineProps {
  codparc: number;
  onSelectOs?: (os: OsListItem) => void;
}

export function OsListInline({ codparc, onSelectOs }: OsListInlineProps) {
  const { data: osList, isLoading } = useMinhasOs(codparc);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: 1.5 }} />)}
      </Box>
    );
  }

  if (!osList || osList.length === 0) {
    return (
      <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', py: 2, textAlign: 'center' }}>
        Nenhuma OS aberta
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {osList.map((os) => {
        const osc = getOsStatusColor(os.STATUS);
        return (
          <Box
            key={os.NUOS}
            onClick={() => onSelectOs?.(os)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              p: 1, borderRadius: 1.5, cursor: onSelectOs ? 'pointer' : 'default',
              border: '1px solid', borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:active': onSelectOs ? { transform: 'scale(0.98)' } : {},
              '&:hover': onSelectOs ? { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.02) } : {},
            }}
          >
            <Box sx={{
              width: 32, height: 32, borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Build sx={{ fontSize: 16, color: 'primary.main' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700 }}>
                  OS {os.NUOS}
                </Typography>
                <Box sx={{ px: 0.4, py: 0.1, borderRadius: 0.4, bgcolor: osc.bg, color: osc.text }}>
                  <Typography sx={{ fontSize: '0.5rem', fontWeight: 700 }}>{os.statusLabel}</Typography>
                </Box>
              </Box>
              {(os.placa || os.tagVeiculo) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <DirectionsCar sx={{ fontSize: 11, color: 'text.disabled' }} />
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    {[os.placa, os.tagVeiculo].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', flexShrink: 0 }}>
              {os.tipoLabel}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
