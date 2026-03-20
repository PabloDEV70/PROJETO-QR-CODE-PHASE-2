import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Alert, CircularProgress, Box,
} from '@mui/material';

export interface CrudDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName: string;
  isProd?: boolean;
}

export function CrudDeleteDialog({
  open, onClose, onConfirm, loading = false, itemName, isProd = false,
}: CrudDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar exclusao</DialogTitle>
      <DialogContent>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Operacoes de escrita NAO sao permitidas no banco PROD
          </Alert>
        )}
        <Typography>
          Tem certeza que deseja excluir <strong>{itemName}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Box sx={{ position: 'relative' }}>
          <Button variant="contained" color="error" onClick={onConfirm} disabled={loading || isProd}>
            Excluir
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
