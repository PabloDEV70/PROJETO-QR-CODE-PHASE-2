import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

interface EncerrarDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function EncerrarDialog({ open, onClose, onConfirm, loading }: EncerrarDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Encerrar situacao</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Tem certeza que deseja encerrar esta situacao? Esta acao nao pode ser desfeita.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
          Encerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
