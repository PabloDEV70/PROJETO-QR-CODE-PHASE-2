import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getChatList } from '@/api/chamados';
import type { ChatListParams } from '@/types/chamados-types';

export function useChatList(params: ChatListParams = {}) {
  return useQuery({
    queryKey: ['chamados', 'chat-list', params],
    queryFn: () => getChatList(params),
    staleTime: 15_000,
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  });
}
