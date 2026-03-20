import { Box, Typography } from '@mui/material';
import { DirectionsCarRounded } from '@mui/icons-material';
import { OsStatusBadge, TipoManutBadge } from '@/components/os/os-badges';
import { elapsedShort } from '@/utils/date-helpers';
import { useChatColors } from './use-chat-colors';
import type { OrdemServico } from '@/types/os-types';

interface OsChatListItemProps {
  os: OrdemServico;
  isSelected: boolean;
  onClick: (nuos: number) => void;
}

export function OsChatListItem({ os, isSelected, onClick }: OsChatListItemProps) {
  const c = useChatColors();

  return (
    <Box
      onClick={() => onClick(os.NUOS)}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1.25, cursor: 'pointer',
        bgcolor: isSelected ? c.listItemSelected : 'transparent',
        '&:hover': { bgcolor: isSelected ? c.listItemSelected : c.listItemHover },
        transition: 'background-color 0.15s',
      }}
    >
      <Box sx={{
        width: 48, height: 48, borderRadius: '50%',
        bgcolor: c.searchInputBg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <DirectionsCarRounded sx={{ fontSize: 24, color: c.textMuted }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, borderBottom: `1px solid ${c.listDivider}`, pb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography sx={{
            fontSize: 15, fontWeight: 500, color: c.textPrimary,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            #{os.NUOS} {os.PLACA ?? 'Sem veiculo'}
            {os.AD_TAG && (
              <Box component="span" sx={{ fontSize: 12, color: c.textMuted, fontWeight: 400, ml: 0.5 }}>
                ({os.AD_TAG})
              </Box>
            )}
          </Typography>
          <Typography sx={{ fontSize: 12, color: c.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {elapsedShort(os.DTABERTURA)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Typography sx={{
            fontSize: 13, color: c.textSecondary, flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {os.MARCAMODELO ?? ''} {os.TOTAL_SERVICOS > 0 ? `| ${os.TOTAL_SERVICOS} servico(s)` : ''}
          </Typography>
          <OsStatusBadge status={os.STATUS} size="sm" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <TipoManutBadge tipo={os.MANUTENCAO} size="sm" />
          {os.CUSTO_TOTAL > 0 && (
            <Typography sx={{ fontSize: 11, color: c.textMuted, ml: 'auto' }}>
              R$ {os.CUSTO_TOTAL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
