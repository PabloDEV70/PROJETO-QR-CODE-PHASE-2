import { useState, useCallback } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { OsChatList } from './os-chat-list';
import { OsChatDetail } from './os-chat-detail';
import { OsChatEmpty } from './os-chat-empty';
import { useOsList } from '@/hooks/use-ordens-servico';
import { useOsUrlParams } from '@/hooks/use-os-url-params';

export function OsChatPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { listParams } = useOsUrlParams();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [chatStatusFilter, setChatStatusFilter] = useState('');
  const [chatTipoFilter, setChatTipoFilter] = useState('');

  const chatParams = {
    ...listParams,
    limit: 100,
    ...(chatStatusFilter && { status: chatStatusFilter }),
    ...(chatTipoFilter && { manutencao: chatTipoFilter }),
  };
  const { data: listData, isLoading } = useOsList(chatParams);
  const ordens = listData?.data ?? [];

  const handleSelect = useCallback((nuos: number) => setSelectedId(nuos), []);
  const handleBack = useCallback(() => setSelectedId(null), []);

  if (isMobile) {
    return (
      <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', display: selectedId ? 'none' : 'flex', flexDirection: 'column' }}>
          <OsChatList ordens={ordens} isLoading={isLoading} selectedNuos={selectedId} onSelect={handleSelect}
            statusFilter={chatStatusFilter} onStatusChange={setChatStatusFilter}
            tipoFilter={chatTipoFilter} onTipoChange={setChatTipoFilter} />
        </Box>
        {selectedId && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <OsChatDetail nuos={selectedId} onBack={handleBack} />
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ width: 380, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <OsChatList ordens={ordens} isLoading={isLoading} selectedNuos={selectedId} onSelect={handleSelect}
          statusFilter={chatStatusFilter} onStatusChange={setChatStatusFilter}
          tipoFilter={chatTipoFilter} onTipoChange={setChatTipoFilter} />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {selectedId ? <OsChatDetail nuos={selectedId} /> : <OsChatEmpty />}
      </Box>
    </Box>
  );
}
