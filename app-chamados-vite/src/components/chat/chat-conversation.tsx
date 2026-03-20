import { useCallback, useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useChamadoById, useChamadoOcorrencias } from '@/hooks/use-chamados';
import { ChatConvHeader } from './chat-conv-header';
import { ChatConvMessages } from './chat-conv-messages';
import { ChatInputBar } from './chat-input-bar';
import { ChatDetailDrawer } from './chat-detail-drawer';

interface ChatConversationProps {
  nuchamado: number;
  onBack?: () => void;
  isOnline?: (codusu: number | null | undefined) => boolean;
}

function SkeletonHeader() {
  return (
    <Box
      sx={{
        height: 64,
        borderBottom: '1px solid #e2e8f0',
        bgcolor: '#fff',
        px: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Skeleton variant="circular" width={32} height={32} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" sx={{ fontSize: 13 }} />
        <Skeleton variant="text" width="40%" sx={{ fontSize: 11 }} />
      </Box>
    </Box>
  );
}

export function ChatConversation({ nuchamado, onBack, isOnline }: ChatConversationProps) {
  const qc = useQueryClient();
  const { data: chamado, isLoading: loadingChamado, isError } = useChamadoById(nuchamado);
  const { data: ocorrencias, isLoading: loadingOcorrencias } = useChamadoOcorrencias(nuchamado);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleSent = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['chamados', 'ocorrencias', nuchamado] });
  }, [qc, nuchamado]);

  const handleOpenDetails = useCallback(() => {
    setDetailsOpen(true);
  }, []);

  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#94a3b8',
          fontSize: 14,
        }}
      >
        Chamado nao encontrado
      </Box>
    );
  }

  if (loadingChamado || !chamado) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <SkeletonHeader />
        <Box sx={{ flex: 1, px: 2, py: 2, bgcolor: '#fafbfc' }}>
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
                sx={{ borderRadius: '12px', width: isRight ? '55%' : '65%', height: 56 + i * 12 }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatConvHeader
        chamado={chamado}
        onBack={onBack}
        onOpenDetails={handleOpenDetails}
        isOnline={isOnline}
      />
      <ChatConvMessages
        chamado={chamado}
        ocorrencias={ocorrencias ?? []}
        isLoading={loadingOcorrencias}
      />
      <ChatInputBar nuchamado={nuchamado} onSent={handleSent} />
      <ChatDetailDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        chamado={chamado}
      />
    </Box>
  );
}
