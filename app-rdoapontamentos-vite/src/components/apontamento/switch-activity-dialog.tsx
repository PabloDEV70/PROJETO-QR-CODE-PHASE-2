import {
  Dialog, DialogTitle, Box, ButtonBase, IconButton, Paper, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { RdoMotivo } from '@/types/rdo-types';

interface SwitchActivityDialogProps {
  open: boolean;
  onClose: () => void;
  motivos: RdoMotivo[];
  currentMotivoCod?: number | null;
  onPick: (motivo: RdoMotivo) => void;
}

export function SwitchActivityDialog({
  open, onClose, motivos, currentMotivoCod, onPick,
}: SwitchActivityDialogProps) {
  const filtered = motivos.filter((m) => m.RDOMOTIVOCOD !== currentMotivoCod);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography fontWeight={700}>Trocar atividade</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {filtered.map((m) => {
          const isProd = m.PRODUTIVO === 'S';
          const color = isProd ? '#16A34A' : '#64748B';
          return (
            <ButtonBase
              key={m.RDOMOTIVOCOD}
              onClick={() => { onPick(m); onClose(); }}
              sx={{ borderRadius: 1.5, width: '100%' }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 1, borderRadius: 1.5,
                  bgcolor: `${color}08`,
                  border: 1, borderColor: `${color}20`,
                  '&:active': { bgcolor: `${color}15` },
                }}
              >
                <Box sx={{
                  width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0,
                }} />
                <Typography variant="body2" fontWeight={700} sx={{ color }}>
                  {m.SIGLA}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'left' }}>
                  {m.DESCRICAO}
                </Typography>
              </Paper>
            </ButtonBase>
          );
        })}
      </Box>
    </Dialog>
  );
}
