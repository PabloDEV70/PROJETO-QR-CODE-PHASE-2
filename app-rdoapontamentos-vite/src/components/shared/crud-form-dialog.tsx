import type { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface CrudFormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  submitLabel?: string;
  children: ReactNode;
  isProd?: boolean;
}

export function CrudFormDialog({
  open,
  onClose,
  title,
  onSubmit,
  loading = false,
  maxWidth = 'sm',
  submitLabel = 'Salvar',
  children,
  isProd = false,
}: CrudFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 6 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isProd && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Operacoes de escrita NAO sao permitidas no banco PROD
          </Alert>
        )}
        {children}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            color="success"
            onClick={onSubmit}
            disabled={loading || isProd}
          >
            {submitLabel}
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                mt: '-12px',
                ml: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
