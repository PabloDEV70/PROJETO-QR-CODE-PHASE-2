import { useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ChatMessageBubble } from './chat-message-bubble';
import { ChatTicketBubble } from './chat-ticket-bubble';
import { useAuthStore } from '@/stores/auth-store';
import { useDeleteOcorrencia } from '@/hooks/use-chamado-mutations';
import { useChatColors } from './use-chat-colors';
import type { Chamado, ChamadoOcorrencia } from '@/types/chamados-types';

const TI_GROUP = 13;

interface ChatConvMessagesProps {
  chamado: Chamado;
  ocorrencias: ChamadoOcorrencia[];
  isLoading: boolean;
}

function SkeletonBubbles() {
  return (
    <Box sx={{ px: 2, py: 2 }}>
      {[false, true, false, true].map((isRight, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            justifyContent: isRight ? 'flex-end' : 'flex-start',
            mb: 1.5,
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{
              borderRadius: '12px',
              width: isRight ? '55%' : '65%',
              height: 56 + i * 12,
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

export function ChatConvMessages({ chamado, ocorrencias, isLoading }: ChatConvMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const codusu = user?.codusu;
  const isTI = user?.codgrupo === TI_GROUP;
  const deleteMutation = useDeleteOcorrencia();
  const c = useChatColors();

  const handleDelete = (nuchamado: number, sequencia: number) => {
    deleteMutation.mutate({ nuchamado, sequencia });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [ocorrencias]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        overflowY: 'auto',
        py: 1.5,
        bgcolor: c.convBg,
        // WhatsApp-style subtle doodle pattern
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='5' cy='5' r='1' fill='${encodeURIComponent(c.convPattern)}'/%3E%3Ccircle cx='25' cy='20' r='0.8' fill='${encodeURIComponent(c.convPattern)}'/%3E%3Ccircle cx='15' cy='35' r='0.6' fill='${encodeURIComponent(c.convPattern)}'/%3E%3Ccircle cx='35' cy='10' r='0.7' fill='${encodeURIComponent(c.convPattern)}'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23p)'/%3E%3C/svg%3E")`,
      }}
    >
      {isLoading ? (
        <SkeletonBubbles />
      ) : (
        <>
          <ChatTicketBubble chamado={chamado} />

          {ocorrencias.map((oc, i) => {
            const prev = i > 0 ? ocorrencias[i - 1] : null;
            const showTail = !prev || prev.ATENDENTE !== oc.ATENDENTE;
            return (
              <ChatMessageBubble
                key={`${oc.NUCHAMADO}-${oc.SEQUENCIA}`}
                ocorrencia={oc}
                isOwn={oc.ATENDENTE === codusu}
                showTail={showTail}
                isTI={isTI}
                onDelete={handleDelete}
              />
            );
          })}
        </>
      )}
    </Box>
  );
}
