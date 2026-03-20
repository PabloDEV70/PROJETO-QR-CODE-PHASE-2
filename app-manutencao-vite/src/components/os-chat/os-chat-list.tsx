import { Box, Typography, Skeleton, Stack } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';
import { OsChatListItem } from './os-chat-list-item';
import { useChatColors } from './use-chat-colors';
import { FilterSelect } from '@/components/shared/filter-select';
import { OS_STATUS_OPTIONS, TIPO_MANUT_OPTIONS } from '@/utils/os-constants';
import type { OrdemServico } from '@/types/os-types';

interface OsChatListProps {
  ordens: OrdemServico[];
  isLoading: boolean;
  selectedNuos: number | null;
  onSelect: (nuos: number) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  tipoFilter: string;
  onTipoChange: (v: string) => void;
}

export function OsChatList({
  ordens, isLoading, selectedNuos, onSelect,
  statusFilter, onStatusChange, tipoFilter, onTipoChange,
}: OsChatListProps) {
  const c = useChatColors();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: c.sidebarBg }}>
      <Box sx={{
        px: 1.5, py: 1, bgcolor: c.sidebarHeaderBg,
        borderBottom: `1px solid ${c.listDivider}`,
      }}>
        <Typography sx={{
          fontFamily: "'STOP', 'Arial Black', sans-serif",
          fontSize: 14, color: c.accent, letterSpacing: '0.04em', mb: 1,
        }}>
          MANUTENCAO OS
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <FilterSelect value={statusFilter} options={OS_STATUS_OPTIONS}
            onChange={onStatusChange} displayEmpty minWidth={120} />
          <FilterSelect value={tipoFilter} options={TIPO_MANUT_OPTIONS}
            onChange={onTipoChange} displayEmpty minWidth={120} />
        </Stack>
      </Box>

      <Box sx={{
        flex: 1, overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: c.scrollbarThumb, borderRadius: 3 },
      }}>
        {isLoading ? (
          <Box sx={{ p: 1.5 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: c.skeletonBg }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" sx={{ fontSize: 14, bgcolor: c.skeletonBg }} />
                  <Skeleton variant="text" width="80%" sx={{ fontSize: 12, bgcolor: c.skeletonBg }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : ordens.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, py: 6 }}>
            <InboxRounded sx={{ fontSize: 48, color: c.listDivider }} />
            <Typography sx={{ fontSize: 14, color: c.textMuted, fontWeight: 500 }}>Nenhuma OS encontrada</Typography>
          </Box>
        ) : (
          <Stack>
            {ordens.map((os) => (
              <OsChatListItem key={os.NUOS} os={os} isSelected={selectedNuos === os.NUOS} onClick={onSelect} />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
