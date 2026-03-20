import { useState } from 'react';
import {
  Drawer, Box, Typography, Stack, IconButton, Tabs, Tab, Button,
} from '@mui/material';
import { Close, OpenInNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FuncionarioDrawerPerfil } from '@/components/funcionarios/funcionario-drawer-perfil';
import { FuncionarioDrawerHistorico } from '@/components/funcionarios/funcionario-drawer-historico';
import { useFuncionarioPerfilSuper } from '@/hooks/use-funcionario';

export interface FuncionarioDrawerProps {
  open: boolean;
  onClose: () => void;
  codparc: number | null;
}

export function FuncionarioDrawer({ open, onClose, codparc }: FuncionarioDrawerProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const { data: perfil, isLoading } = useFuncionarioPerfilSuper(open ? codparc : null);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 420, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{
        p: 2, bgcolor: '#1976d2', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {perfil?.nomeparc ?? `Funcionario #${codparc}`}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Perfil" sx={{ textTransform: 'none', fontSize: 13 }} />
          <Tab label="Historico" sx={{ textTransform: 'none', fontSize: 13 }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {tab === 0 && (
          <FuncionarioDrawerPerfil perfil={perfil} isLoading={isLoading} />
        )}
        {tab === 1 && (
          <FuncionarioDrawerHistorico perfil={perfil} isLoading={isLoading} />
        )}
      </Box>

      {/* Footer */}
      <Stack sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<OpenInNew />}
          onClick={() => { onClose(); navigate(`/funcionarios/${codparc}`); }}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Ver perfil completo
        </Button>
      </Stack>
    </Drawer>
  );
}
