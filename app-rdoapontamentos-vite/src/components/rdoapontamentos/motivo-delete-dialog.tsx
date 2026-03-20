import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Alert,
} from '@mui/material';
import type { RdoMotivo } from '@/types/rdo-types';

interface MotivoDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  motivo: RdoMotivo | null;
  isProd: boolean;
}

export function MotivoDeleteDialog({
  open, onClose, onConfirm, loading, motivo, isProd,
}: MotivoDeleteDialogProps) {
  if (!motivo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir Motivo</DialogTitle>
      <DialogContent>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Exclusao bloqueada no banco PROD. Selecione TESTE ou TREINA.
          </Alert>
        )}
        <Typography>
          Tem certeza que deseja excluir o motivo{' '}
          <strong>{motivo.SIGLA}</strong> - {motivo.DESCRICAO}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isProd || loading}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
