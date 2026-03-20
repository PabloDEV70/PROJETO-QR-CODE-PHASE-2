import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, CircularProgress } from '@mui/material';
import { SituacaoSelect } from '@/components/situacoes/situacao-select';
import { PrioridadeSelect } from '@/components/situacoes/prioridade-select';
import type { TrocarSituacaoPayload } from '@/types/hstvei-types';

interface TrocarSituacaoDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: TrocarSituacaoPayload) => void;
  loading?: boolean;
}

export function TrocarSituacaoDialog({ open, onClose, onConfirm, loading }: TrocarSituacaoDialogProps) {
  const [idsit, setIdsit] = useState<number | ''>('');
  const [idpri, setIdpri] = useState<number | ''>('');

  const handleConfirm = () => {
    if (!idsit) return;
    onConfirm({ idsit: idsit as number, ...(idpri !== '' && { idpri: idpri as number }) });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Trocar situacao</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <SituacaoSelect value={idsit} onChange={setIdsit} required />
          <PrioridadeSelect value={idpri} onChange={setIdpri} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading || !idsit}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
          Trocar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
