import { useState } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, Tabs, Tab,
  Skeleton, Button,
} from '@mui/material';
import { Close, Receipt, OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotaDetalhe } from '@/hooks/use-em-tempo-real';
import { NotaDetalheCabTab } from '@/components/em-tempo-real/nota-detalhe-cab-tab';
import { NotaDetalheItensTab } from '@/components/em-tempo-real/nota-detalhe-itens-tab';
import { NotaDetalheTopTab } from '@/components/em-tempo-real/nota-detalhe-top-tab';
import { NotaDetalheVarTab } from '@/components/em-tempo-real/nota-detalhe-var-tab';

const statusBgColor: Record<string, string> = {
  A: '#0288d1',
  L: '#2e7d32',
  P: '#ed6c02',
};

export interface NotaDetalheDrawerProps {
  open: boolean;
  onClose: () => void;
  nunota: number | null;
}

export function NotaDetalheDrawer({ open, onClose, nunota }: NotaDetalheDrawerProps) {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const { data, isLoading } = useNotaDetalhe(open ? nunota : null);

  const cab = data?.cabecalho;
  const bgColor = statusBgColor[cab?.STATUSNOTA ?? ''] ?? '#424242';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{
        p: 2, bgcolor: bgColor, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Receipt />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Nota {nunota}
            </Typography>
            {cab && (
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                TOP {cab.CODTIPOPER} | {cab.STATUSNOTA}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
          <Tab label="Cabecalho" sx={{ textTransform: 'none', minWidth: 0 }} />
          <Tab
            label={`Itens${data ? ` (${data.itens.length})` : ''}`}
            sx={{ textTransform: 'none', minWidth: 0 }}
          />
          <Tab label="TOP Config" sx={{ textTransform: 'none', minWidth: 0 }} />
          <Tab
            label={`Historico${data ? ` (${data.variacoes.length})` : ''}`}
            sx={{ textTransform: 'none', minWidth: 0 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ overflow: 'auto', flex: 1, p: 2 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        ) : data ? (
          <>
            {tab === 0 && <NotaDetalheCabTab cab={data.cabecalho} />}
            {tab === 1 && <NotaDetalheItensTab itens={data.itens} />}
            {tab === 2 && <NotaDetalheTopTab top={data.top} />}
            {tab === 3 && <NotaDetalheVarTab variacoes={data.variacoes} />}
          </>
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
            <Typography color="text.secondary">Nota nao encontrada</Typography>
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {nunota && (
        <Stack sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<OpenInNew />}
            onClick={() => {
              onClose();
              navigate(`/cab/${nunota}`);
            }}
          >
            Abrir pagina completa
          </Button>
        </Stack>
      )}
    </Drawer>
  );
}
