import { Box, Typography, Chip, IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import { DarkMode, LightMode, Search, FlightTakeoff } from '@mui/icons-material';
import { useThemeStore } from '@/stores/theme-store';
import { usePainelStore } from '@/stores/painel-store';
import type { PainelResponse, HstVeiStats } from '@/types/hstvei-types';

interface StatsBarV2Props {
  painel: PainelResponse | undefined;
  stats: HstVeiStats | undefined;
}

export function StatsBarV2({ painel, stats }: StatsBarV2Props) {
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const searchTerm = usePainelStore((s) => s.searchTerm);
  const setSearchTerm = usePainelStore((s) => s.setSearchTerm);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      px: 2, py: 1.5,
      bgcolor: 'background.paper',
      borderBottom: 1, borderColor: 'divider',
    }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FlightTakeoff sx={{ fontSize: 22, color: 'primary.main' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.04em' }}>
          PAINEL FROTA
        </Typography>
      </Box>

      {/* Metrics */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Chip label={`${painel?.totalVeiculos ?? 0} veiculos`} size="small"
          sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'primary.contrastText' }} />
        <Chip label={`${painel?.totalSituacoesAtivas ?? 0} situacoes`} size="small"
          sx={{ fontWeight: 600 }} variant="outlined" />
        {stats && stats.urgentes > 0 && (
          <Chip label={`${stats.urgentes} urgentes`} size="small" color="error" />
        )}
        {stats && stats.atrasadas > 0 && (
          <Chip label={`${stats.atrasadas} atrasadas`} size="small" color="warning" />
        )}
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Buscar placa, tag..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            sx: { fontSize: '0.85rem', height: 34 },
          },
        }}
        sx={{ ml: 'auto', width: 220 }}
      />

      {/* Theme toggle */}
      <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
        <IconButton onClick={toggleTheme} size="small">
          {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
