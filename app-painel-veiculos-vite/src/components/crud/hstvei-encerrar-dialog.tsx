import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';
import { useEncerrarHstVei } from '@/hooks/use-hstvei-crud';
import type { HstVeiRow } from '@/api/hstvei-crud';

interface Props {
  open: boolean;
  row: HstVeiRow | null;
  onClose: () => void;
}

export function HstVeiEncerrarDialog({ open, row, onClose }: Props) {
  const encerrar = useEncerrarHstVei();

  const handleConfirm = async () => {
    if (!row) return;
    await encerrar.mutateAsync(row.ID);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem' }}>Encerrar Situacao</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: '0.85rem' }}>
          Encerrar a situacao <strong>&quot;{row?.situacaoDescricao}&quot;</strong> do veiculo{' '}
          <strong>{row?.placa}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">Cancelar</Button>
        <Button onClick={handleConfirm} color="error" variant="contained" size="small" disabled={encerrar.isPending}>
          {encerrar.isPending ? <CircularProgress size={16} /> : 'Encerrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
