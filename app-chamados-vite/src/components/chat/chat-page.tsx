import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ChatList } from '@/components/chat/chat-list';
import { ChatConversation } from '@/components/chat/chat-conversation';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';
import { useChatList } from '@/hooks/use-chat-list';
import { useChatUnread } from '@/hooks/use-chat-unread';
import { usePresence } from '@/hooks/use-presence';
import { useAuthStore } from '@/stores/auth-store';
import type { ChatListParams } from '@/types/chamados-types';

const TI_GROUP = 13;

export function ChatPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useAuthStore((s) => s.user);

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'todos';
  const searchText = searchParams.get('q') || '';

  const setStatusFilter = useCallback((v: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set('status', v); else next.delete('status');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setSearch = useCallback((v: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set('q', v); else next.delete('q');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const isTI = user?.codgrupo === TI_GROUP;

  const queryParams = useMemo<ChatListParams>(() => {
    const p: ChatListParams = {};
    if (searchText) p.search = searchText;
    if (statusFilter && statusFilter !== 'todos') {
      p.status = statusFilter as ChatListParams['status'];
    }
    // Non-TI users: scope to own chamados + same department
    if (!isTI && user?.codusu) {
      p.scopeUser = user.codusu;
    }
    return p;
  }, [searchText, statusFilter, isTI, user?.codusu]);

  const chatListQuery = useChatList(queryParams);
  const { isUnread, markAsRead } = useChatUnread(chatListQuery.data ?? []);
  const presence = usePresence();

  const handleSelect = useCallback((nuchamado: number) => {
    setSelectedId(nuchamado);
    markAsRead(nuchamado);
  }, [markAsRead]);

  const handleBack = useCallback(() => {
    setSelectedId(null);
  }, []);

  // MOBILE
  if (isMobile) {
    return (
      <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          height: '100%',
          display: selectedId ? 'none' : 'flex',
          flexDirection: 'column',
        }}>
          <ChatList
            selectedNuchamado={selectedId}
            onSelectChamado={handleSelect}
            onNewChamado={() => navigate('/chamados/chat/novo')}
            unreadMap={{ isUnread }}
            items={chatListQuery.data ?? []}
            isLoading={chatListQuery.isLoading}
            search={searchText}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onlineCount={presence.onlineCount}
            isOnline={presence.isOnline}
          />
        </Box>

        {selectedId && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <ChatConversation
              nuchamado={selectedId}
              onBack={handleBack}
              isOnline={presence.isOnline}
            />
          </Box>
        )}
      </Box>
    );
  }

  // DESKTOP
  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Box sx={{
        width: 360,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        <ChatList
          selectedNuchamado={selectedId}
          onSelectChamado={handleSelect}
          onNewChamado={() => navigate('/chamados/chat/novo')}
          unreadMap={{ isUnread }}
          items={chatListQuery.data ?? []}
          isLoading={chatListQuery.isLoading}
          search={searchText}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onlineCount={presence.onlineCount}
          isOnline={presence.isOnline}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedId ? (
          <ChatConversation nuchamado={selectedId} isOnline={presence.isOnline} />
        ) : (
          <ChatEmptyState />
        )}
      </Box>
    </Box>
  );
}
