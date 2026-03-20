import { Box, TextField, Paper, Typography } from '@mui/material';
import type { HstVeiRow } from '@/api/hstvei-crud';

interface Props {
  nuos: string;
  numos: string;
  nunota: string;
  onNuosChange: (v: string) => void;
  onNumosChange: (v: string) => void;
  onNunotaChange: (v: string) => void;
  isEdit: boolean;
  editRow: HstVeiRow | null;
}

export function OsSection({ nuos, numos, nunota, onNuosChange, onNumosChange, onNunotaChange, isEdit, editRow }: Props) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField size="small" label="OS Manutencao" value={nuos}
          onChange={(e) => onNuosChange(e.target.value)} type="number" fullWidth
          slotProps={{ htmlInput: { min: 0 } }} />
        <TextField size="small" label="OS Comercial" value={numos}
          onChange={(e) => onNumosChange(e.target.value)} type="number" fullWidth
          slotProps={{ htmlInput: { min: 0 } }} />
      </Box>

      <TextField size="small" label="Cab. Movimento (TGFCAB)" value={nunota}
        onChange={(e) => onNunotaChange(e.target.value)} type="number" fullWidth
        slotProps={{ htmlInput: { min: 0 } }}
        helperText="NUNOTA do movimento vinculado" />

      {isEdit && editRow && (editRow.osStatus || editRow.mosSituacao) && (
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
          {editRow.NUOS && (
            <Box sx={{ fontSize: '0.72rem', mb: 0.5 }}>
              <Typography component="span" sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                OS Manut. #{String(editRow.NUOS)}:
              </Typography>{' '}
              {String(editRow.osStatus ?? '-')} | {String(editRow.osTipo ?? '-')} | {String(editRow.osManutencao ?? '-')}
            </Box>
          )}
          {editRow.NUMOS && (
            <Box sx={{ fontSize: '0.72rem' }}>
              <Typography component="span" sx={{ fontWeight: 700, fontSize: 'inherit' }}>
                OS Comerc. #{String(editRow.NUMOS)}:
              </Typography>{' '}
              {String(editRow.mosSituacao ?? '-')} | Cliente: {String(editRow.mosCliente ?? '-')} | {String(editRow.mosAtendente ?? '-')}
            </Box>
          )}
        </Paper>
      )}
    </>
  );
}
