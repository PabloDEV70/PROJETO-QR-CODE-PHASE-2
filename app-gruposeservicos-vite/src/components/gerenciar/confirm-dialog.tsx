import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Chip,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  impactLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open, title, message, impactLabel, confirmLabel = 'Confirmar',
  onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Warning color="warning" />
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, mb: 1 }}>{message}</Typography>
        {impactLabel && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
            <Chip label={impactLabel} size="small" color="warning" sx={{ fontSize: 12 }} />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="warning"
          disabled={loading}
        >
          {loading ? 'Aguarde...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
