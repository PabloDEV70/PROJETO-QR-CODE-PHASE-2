import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';
import { getMotivoIcon } from '@/utils/motivo-icons';
import { getCategoryMeta } from '@/utils/wrench-time-categories';
import type { RdoMotivo } from '@/types/rdo-types';

interface SwitchConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  motivo: RdoMotivo;
  currentSigla: string | null;
  onConfirm: () => void;
  isPending?: boolean;
}

function getColor(m: RdoMotivo): string {
  if (m.PRODUTIVO === 'S') return '#16a34a';
  if (m.WTCATEGORIA) return getCategoryMeta(m.WTCATEGORIA).color;
  return '#64748B';
}

export function SwitchConfirmDialog({ open, onClose, motivo, currentSigla, onConfirm, isPending }: SwitchConfirmDialogProps) {
  const Icon = getMotivoIcon(motivo.SIGLA);
  const color = getColor(motivo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SwapHoriz sx={{ fontSize: 20, color: 'text.secondary' }} />
        Trocar atividade
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 1 }}>
          {currentSigla && (
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.secondary' }}>
              {currentSigla}
            </Typography>
          )}
          <SwapHoriz sx={{ fontSize: 18, color: 'text.disabled' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: 0.5, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon sx={{ fontSize: 15 }} />
            </Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color }}>
              {motivo.SIGLA}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {motivo.DESCRICAO}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" size="small" disabled={isPending} sx={{ bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}>
          Trocar para {motivo.SIGLA}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
