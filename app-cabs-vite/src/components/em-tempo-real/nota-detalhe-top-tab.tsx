import { Paper, Typography, Stack, Chip } from '@mui/material';
import { Settings, Tune } from '@mui/icons-material';
import type { NotaDetalheTop } from '@/types/em-tempo-real-types';

const s = (v: unknown): string => {
  if (v == null) return '-';
  if (typeof v === 'object') return '-';
  return String(v);
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function FlagChip({ label, value }: { label: string; value: unknown }) {
  const isYes = value === 'S';
  return (
    <Chip
      label={`${label}: ${isYes ? 'Sim' : 'Nao'}`}
      size="small"
      variant="outlined"
      color={isYes ? 'success' : 'default'}
      sx={{ fontSize: '0.7rem' }}
    />
  );
}

interface NotaDetalheTopTabProps {
  top: NotaDetalheTop | null;
}

export function NotaDetalheTopTab({ top }: NotaDetalheTopTabProps) {
  if (!top) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
        <Settings sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography color="text.secondary">
          Configuracao TOP nao encontrada
        </Typography>
      </Stack>
    );
  }

  const fmtDate = (v: unknown): string => {
    if (v == null || typeof v === 'object') return '-';
    const d = new Date(String(v));
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('pt-BR');
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Settings fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight="bold">
            TOP {s(top.CODTIPOPER)} - {s(top.DESCROPER)}
          </Typography>
        </Stack>
        <InfoRow label="Versao (DHALTER)" value={fmtDate(top.DHALTER)} />
        <InfoRow label="Ativo" value={top.ATIVO === 'S' ? 'Sim' : 'Nao'} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <Tune fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight="bold">Comportamento</Typography>
        </Stack>
        <InfoRow label="Tipo Movimento" value={s(top.TIPMOV)} />
        <InfoRow label="Estoque" value={s(top.ATUALEST)} />
        <InfoRow label="Financeiro" value={s(top.ATUALFIN)} />
      </Paper>

      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Flags
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <FlagChip label="NFe" value={top.NFE} />
          <FlagChip label="Bonificacao" value={top.BONIFICACAO} />
        </Stack>
      </Paper>
    </Stack>
  );
}
