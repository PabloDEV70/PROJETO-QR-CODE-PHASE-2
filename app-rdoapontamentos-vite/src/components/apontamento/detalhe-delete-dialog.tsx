import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Alert, Typography,
} from '@mui/material';
import { useDeleteDetalhe, useWriteGuard } from '@/hooks/use-rdo-mutations';
import { hhmmToString } from '@/utils/hora-utils';
import type { RdoDetalheItem } from '@/types/rdo-types';

interface DetalheDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  codrdo: number;
  item: RdoDetalheItem | null;
}

export function DetalheDeleteDialog({ open, onClose, codrdo, item }: DetalheDeleteDialogProps) {
  const { blocked: isProd } = useWriteGuard();
  const deleteMut = useDeleteDetalhe();

  const handleConfirm = () => {
    if (!item) return;
    deleteMut.mutate({ codrdo, item: item.ITEM }, { onSuccess: onClose });
  };

  const label = item
    ? `${hhmmToString(item.HRINI)} - ${hhmmToString(item.HRFIM)} (${item.motivoSigla ?? 'N/A'})`
    : '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Excluir Atividade</DialogTitle>
      <DialogContent>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Escrita bloqueada no banco PROD.
          </Alert>
        )}
        <Typography>
          Excluir atividade <strong>{label}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={handleConfirm}
          disabled={isProd || deleteMut.isPending}>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
