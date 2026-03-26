import { Box, Typography, Stack, Card } from '@mui/material';
import { AccessTime, DirectionsCarRounded } from '@mui/icons-material';
import { TipoManutBadge, StatusGigBadge } from '@/components/os/os-badges';
import { elapsedShort } from '@/utils/date-helpers';
import type { OrdemServico } from '@/types/os-types';

interface Props {
  os: OrdemServico;
  onClick: () => void;
}

export function OsKanbanCard({ os, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        borderRadius: '4px',
        p: 1.5, mb: 1,
        border: '1px solid', borderColor: 'divider',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderColor: 'primary.light',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>
          #{os.NUOS}
        </Typography>
        <TipoManutBadge tipo={os.MANUTENCAO} size="sm" />
        <Box sx={{ flex: 1 }} />
        <StatusGigBadge statusGig={os.AD_STATUSGIG} />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
        <DirectionsCarRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
          {os.PLACA ?? 'Sem veiculo'}{os.AD_TAG ? ` (${os.AD_TAG})` : ''}
        </Typography>
      </Stack>

      {os.MARCAMODELO && (
        <Typography sx={{
          fontSize: 11, color: 'text.disabled', mb: 0.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {os.MARCAMODELO}
        </Typography>
      )}

      {os.OBSERVACAO && (
        <Typography sx={{
          fontSize: 10.5, color: 'text.secondary', mb: 0.5,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          fontStyle: 'italic', lineHeight: 1.3,
        }}>
          {String(os.OBSERVACAO)}
        </Typography>
      )}

      {os.TOTAL_SERVICOS > 0 && (
        <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 0.5 }}>
          {os.TOTAL_SERVICOS} servico(s)
        </Typography>
      )}

      <Stack direction="row" alignItems="center" spacing={0.5}
        sx={{ color: 'text.disabled', pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <AccessTime sx={{ fontSize: 12 }} />
        <Typography sx={{ fontSize: 10.5 }}>
          {elapsedShort(os.DTABERTURA)}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {os.KM != null && os.KM > 1 && (
          <Typography sx={{ fontSize: 10.5 }}>
            {os.KM.toLocaleString('pt-BR')} km
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
