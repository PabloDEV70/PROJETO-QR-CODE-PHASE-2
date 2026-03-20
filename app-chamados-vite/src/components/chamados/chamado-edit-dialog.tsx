import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, FormControl, InputLabel,
  Select as MuiSelect, MenuItem, Button, CircularProgress,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { ChamadoStatusCode, ChamadoPrioridadeCode } from '@/types/chamados-types';
import { STATUS_MAP, PRIO_MAP, ALL_STATUSES, ALL_PRIOS, TIPO_ENTRIES } from '@/utils/chamados-constants';

interface ChamadoEditDialogProps {
  open: boolean;
  onClose: () => void;
  chamado: {
    DESCRCHAMADO: string | null;
    STATUS: ChamadoStatusCode;
    PRIORIDADE: ChamadoPrioridadeCode | null;
    TIPOCHAMADO: string | null;
    SETOR: string | null;
    CODPARC: number | null;
  };
  onSave: (data: {
    DESCRCHAMADO?: string;
    STATUS?: ChamadoStatusCode;
    PRIORIDADE?: ChamadoPrioridadeCode;
    TIPOCHAMADO?: string;
    SETOR?: string;
    CODPARC?: number;
  }) => void;
  isPending: boolean;
}

export function ChamadoEditDialog({ open, onClose, chamado, onSave, isPending }: ChamadoEditDialogProps) {
  const [descr, setDescr] = useState(chamado.DESCRCHAMADO ?? '');
  const [sts, setSts] = useState<ChamadoStatusCode>(chamado.STATUS);
  const [prio, setPrio] = useState<ChamadoPrioridadeCode>(chamado.PRIORIDADE ?? 'M');
  const [tipo, setTipo] = useState(chamado.TIPOCHAMADO ?? '99');
  const [setor, setSetor] = useState(chamado.SETOR ?? '');

  const handleSubmit = () => {
    const payload: Record<string, string | number> = {};
    if (descr !== (chamado.DESCRCHAMADO ?? '')) payload.DESCRCHAMADO = descr;
    if (sts !== chamado.STATUS) payload.STATUS = sts;
    if (prio !== (chamado.PRIORIDADE ?? 'M')) payload.PRIORIDADE = prio;
    if (tipo !== (chamado.TIPOCHAMADO ?? '99')) payload.TIPOCHAMADO = tipo;
    if (setor !== (chamado.SETOR ?? '')) payload.SETOR = setor;
    if (Object.keys(payload).length === 0) { onClose(); return; }
    onSave(payload as {
      DESCRCHAMADO?: string;
      STATUS?: ChamadoStatusCode;
      PRIORIDADE?: ChamadoPrioridadeCode;
      TIPOCHAMADO?: string;
      SETOR?: string;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Chamado</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Descricao" multiline rows={3}
            value={descr} onChange={(e) => setDescr(e.target.value)}
            fullWidth size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <MuiSelect value={sts} label="Status"
              onChange={(e: SelectChangeEvent) =>
                setSts(e.target.value as ChamadoStatusCode)
              }>
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{STATUS_MAP[s].label}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Prioridade</InputLabel>
            <MuiSelect value={prio} label="Prioridade"
              onChange={(e: SelectChangeEvent) =>
                setPrio(e.target.value as ChamadoPrioridadeCode)
              }>
              {ALL_PRIOS.map((p) => (
                <MenuItem key={p} value={p}>{PRIO_MAP[p].label}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <MuiSelect value={tipo} label="Tipo"
              onChange={(e: SelectChangeEvent) => setTipo(e.target.value)}>
              {TIPO_ENTRIES.map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
          <TextField
            label="Setor" value={setor}
            onChange={(e) => setSetor(e.target.value)}
            fullWidth size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isPending}
          startIcon={isPending ? <CircularProgress size={16} /> : undefined}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
