import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { CheckCircle, Pause } from '@mui/icons-material';

interface StopDialogProps {
  open: boolean;
  onClose: () => void;
  servicoNome: string | null;
  nuos: number;
  onPause: () => void;
  onFinish: () => void;
  isPending?: boolean;
  isSwitching?: boolean;
}

export function StopDialog({ open, onClose, servicoNome, nuos, onPause, onFinish, isPending, isSwitching }: StopDialogProps) {
  const title = isSwitching ? `Trocar atividade — OS ${nuos}` : `Parar atividade — OS ${nuos}`;
  const pauseLabel = isSwitching ? 'Manter servico' : 'Pausar';
  const description = isSwitching
    ? 'Deseja finalizar o servico atual antes de trocar, ou manter em execucao?'
    : 'Deseja apenas pausar (servico continua em execucao) ou finalizar o servico?';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Voce esta trabalhando no servico <strong>{servicoNome ?? `#${nuos}`}</strong>.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={isPending}>
          Cancelar
        </Button>
        <Button
          onClick={onPause} variant="contained" size="small" disabled={isPending}
          startIcon={<Pause sx={{ fontSize: 16 }} />}
          sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
        >
          {pauseLabel}
        </Button>
        <Button
          onClick={onFinish} variant="contained" size="small" disabled={isPending}
          startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
          color="success"
        >
          Finalizar servico
        </Button>
      </DialogActions>
    </Dialog>
  );
}
