import { Paper, Typography, Stack, Chip } from '@mui/material';
import { Settings, Tune } from '@mui/icons-material';
import type { NotaDetalheTop } from '@/types/em-tempo-real-types';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" textAlign="right">
        {value || '-'}
      </Typography>
    </Stack>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      {icon}
      <Typography variant="subtitle2" fontWeight="bold">{title}</Typography>
    </Stack>
  );
}

function FlagChip({ label, value }: { label: string; value: string | null }) {
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

  const fmtDate = (v: string | null) => {
    if (!v) return '-';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('pt-BR');
  };

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<Settings fontSize="small" color="action" />}
          title={`TOP ${top.CODTIPOPER} - ${top.DESCROPER}`}
        />
        <InfoRow label="Versao (DHALTER)" value={fmtDate(top.DHALTER)} />
        <InfoRow label="Ativo" value={top.ATIVO === 'S' ? 'Sim' : 'Nao'} />
        <InfoRow label="Modelo" value={top.MODELO} />
      </Paper>

      {/* Operation behavior */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <SectionHeader
          icon={<Tune fontSize="small" color="action" />}
          title="Comportamento"
        />
        <InfoRow label="Tipo Movimento" value={top.TIPMOV_DESCRICAO} />
        <InfoRow label="Estoque" value={top.ATUALEST_DESCRICAO} />
        <InfoRow label="Financeiro" value={top.ATUALFIN_DESCRICAO} />
        <InfoRow label="Frete" value={top.TIPFRETE_DESCRICAO} />
        <InfoRow label="Emitente" value={top.EMITENTE_DESCRICAO} />
      </Paper>

      {/* Flags */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Flags
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <FlagChip label="NFe" value={top.HABILITANFE} />
          <FlagChip label="Gol.Neg." value={top.GOLNEG} />
          <FlagChip label="Bonificacao" value={top.BONIFICACAO} />
          <FlagChip label="Lanc.Dedutivel" value={top.LANCDEDUTIVEL} />
          <FlagChip label="Gera Duplicata" value={top.GERADUPLICATA} />
          <FlagChip label="Ctrl.Estoque" value={top.CONTROLEEST} />
        </Stack>
      </Paper>

      {/* Layout Fields */}
      {(top.AD_LAYOUTCAB || top.AD_LAYOUTITE || top.AD_LAYOUTFIN) && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
            Layouts Configurados
          </Typography>
          {top.AD_LAYOUTCAB && <InfoRow label="Layout Cab." value={top.AD_LAYOUTCAB} />}
          {top.AD_LAYOUTITE && <InfoRow label="Layout Itens" value={top.AD_LAYOUTITE} />}
          {top.AD_LAYOUTFIN && <InfoRow label="Layout Fin." value={top.AD_LAYOUTFIN} />}
        </Paper>
      )}
    </Stack>
  );
}
