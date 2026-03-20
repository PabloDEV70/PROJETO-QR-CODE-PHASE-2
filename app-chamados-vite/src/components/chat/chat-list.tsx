import { Box, Typography, Skeleton, Stack } from '@mui/material';
import { InboxRounded } from '@mui/icons-material';
import { ChatListHeader } from './chat-list-header';
import { ChatListItemRow } from './chat-list-item';
import { useChatColors } from './use-chat-colors';
import type { ChatListItem } from '@/types/chamados-types';

interface ChatListProps {
  selectedNuchamado: number | null;
  onSelectChamado: (nuchamado: number) => void;
  onNewChamado: () => void;
  unreadMap: { isUnread: (item: ChatListItem) => boolean };
  items: ChatListItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onlineCount?: number;
  isOnline?: (codusu: number | null | undefined) => boolean;
}

function SkeletonItems({ skeletonBg }: { skeletonBg: string }) {
  return (
    <Box sx={{ p: 1.5 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1 }}>
          <Skeleton variant="circular" width={32} height={32}
            sx={{ bgcolor: skeletonBg }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" sx={{ fontSize: 13, bgcolor: skeletonBg }} />
            <Skeleton variant="text" width="40%" sx={{ fontSize: 11, bgcolor: skeletonBg }} />
            <Skeleton variant="text" width="80%" sx={{ fontSize: 12, bgcolor: skeletonBg }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function EmptyState({ listDivider, textMuted }: { listDivider: string; textMuted: string }) {
  return (
    <Box
      sx={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 1, py: 6,
      }}
    >
      <InboxRounded sx={{ fontSize: 48, color: listDivider }} />
      <Typography sx={{ fontSize: 14, color: textMuted, fontWeight: 500 }}>
        Nenhum chamado encontrado
      </Typography>
    </Box>
  );
}

export function ChatList({
  selectedNuchamado,
  onSelectChamado,
  onNewChamado,
  unreadMap,
  items,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onlineCount,
  isOnline,
}: ChatListProps) {
  const c = useChatColors();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: c.sidebarBg }}>
      <ChatListHeader
        search={search}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onNewChamado={onNewChamado}
        onlineCount={onlineCount}
      />

      {/* Scrollable list */}
      <Box
        sx={{
          flex: 1, overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: c.scrollbarThumb,
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {isLoading ? (
          <SkeletonItems skeletonBg={c.skeletonBg} />
        ) : items.length === 0 ? (
          <EmptyState listDivider={c.listDivider} textMuted={c.textMuted} />
        ) : (
          <Stack>
            {items.map((item) => (
              <ChatListItemRow
                key={item.NUCHAMADO}
                item={item}
                isSelected={selectedNuchamado === item.NUCHAMADO}
                isUnread={unreadMap.isUnread(item)}
                isOnline={isOnline?.(item.SOLICITANTE)}
                onClick={onSelectChamado}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
