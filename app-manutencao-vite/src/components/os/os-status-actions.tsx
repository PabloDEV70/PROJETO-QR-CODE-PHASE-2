import { useState } from 'react';
import {
  Stack, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography,
} from '@mui/material';
import {
  PlayArrowRounded, CheckCircleRounded,
  CancelRounded, ReplayRounded, UndoRounded,
} from '@mui/icons-material';
import {
  useChangeOsStatus, useFinalizeOs, useCancelOs, useReopenOs,
} from '@/hooks/use-os-mutations';
import { useAuthStore } from '@/stores/auth-store';
import type { OsStatusCode } from '@/types/os-types';

interface ConfirmState {
  action: string;
  label: string;
  color: 'success' | 'error' | 'warning' | 'info';
}

interface OsStatusActionsProps {
  nuos: number;
  status: OsStatusCode;
}

export function OsStatusActions({ nuos, status }: OsStatusActionsProps) {
  const isProd = useAuthStore((s) => s.database) === 'PROD';
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const changeStatus = useChangeOsStatus();
  const finalize = useFinalizeOs();
  const cancel = useCancelOs();
  const reopen = useReopenOs();

  const loading = changeStatus.isPending || finalize.isPending
    || cancel.isPending || reopen.isPending;

  const handleConfirm = () => {
    if (!confirm) return;
    const close = () => setConfirm(null);
    switch (confirm.action) {
      case 'start': changeStatus.mutate([nuos, 'E'], { onSuccess: close }); break;
      case 'finalize': finalize.mutate([nuos], { onSuccess: close }); break;
      case 'cancel': cancel.mutate([nuos], { onSuccess: close }); break;
      case 'reopen': reopen.mutate([nuos], { onSuccess: close }); break;
      case 'return': changeStatus.mutate([nuos, 'A'], { onSuccess: close }); break;
    }
  };

  const ask = (action: string, label: string, color: ConfirmState['color']) =>
    () => setConfirm({ action, label, color });

  return (
    <>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {status === 'A' && (
          <>
            <Button size="small" variant="contained" color="info"
              startIcon={<PlayArrowRounded />} disabled={isProd}
              onClick={ask('start', 'Iniciar execucao desta OS?', 'info')}>
              Iniciar
            </Button>
            <Button size="small" variant="outlined" color="error"
              startIcon={<CancelRounded />} disabled={isProd}
              onClick={ask('cancel', 'Cancelar esta OS?', 'error')}>
              Cancelar
            </Button>
          </>
        )}
        {status === 'E' && (
          <>
            <Button size="small" variant="contained" color="success"
              startIcon={<CheckCircleRounded />} disabled={isProd}
              onClick={ask('finalize', 'Finalizar esta OS?', 'success')}>
              Finalizar
            </Button>
            <Button size="small" variant="outlined" color="warning"
              startIcon={<UndoRounded />} disabled={isProd}
              onClick={ask('return', 'Devolver OS para Aberta?', 'warning')}>
              Devolver
            </Button>
            <Button size="small" variant="outlined" color="error"
              startIcon={<CancelRounded />} disabled={isProd}
              onClick={ask('cancel', 'Cancelar esta OS?', 'error')}>
              Cancelar
            </Button>
          </>
        )}
        {(status === 'F' || status === 'C') && (
          <Button size="small" variant="outlined" color="warning"
            startIcon={<ReplayRounded />} disabled={isProd}
            onClick={ask('reopen', 'Reabrir esta OS?', 'warning')}>
            Reabrir
          </Button>
        )}
      </Stack>

      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar acao</DialogTitle>
        <DialogContent>
          <Typography>{confirm?.label}</Typography>
          {isProd && (
            <Typography color="error" sx={{ mt: 1, fontSize: 13 }}>
              Bloqueado no banco PROD
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} color="inherit">Cancelar</Button>
          <Button variant="contained" color={confirm?.color ?? 'info'}
            onClick={handleConfirm} disabled={loading || isProd}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
