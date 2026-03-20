import { Close } from '@mui/icons-material';
import {
  Box, Dialog, DialogContent, DialogTitle, Divider,
  IconButton, LinearProgress, Stack, Typography,
} from '@mui/material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WrenchTimeBreakdown } from '@/types/wrench-time-types';

interface WtMotivoDrillProps {
  open: boolean;
  onClose: () => void;
  breakdown: WrenchTimeBreakdown | null;
}

export function WtMotivoDrill({ open, onClose, breakdown }: WtMotivoDrillProps) {
  if (!breakdown) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: breakdown.color }} />
            <Typography variant="h6">{breakdown.label}</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose} edge="end"><Close /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Total: {fmtMin(breakdown.totalMin)} — {breakdown.percentOfTotal}% do total
        </Typography>
        <Stack spacing={2}>
          {breakdown.motivos.map((m) => (
            <Box key={m.cod}>
              <Stack direction="row" alignItems="center" justifyContent="space-between"
                spacing={2} sx={{ mb: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary"
                    sx={{ minWidth: 55 }}>
                    [{m.sigla}]
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{m.descricao}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 55 }}>
                    {fmtMin(m.totalMin)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                    {m.percentOfCategory}%
                  </Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate" value={m.percentOfCategory}
                sx={{
                  height: 6, borderRadius: 3, bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { bgcolor: breakdown.color },
                }}
              />
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
