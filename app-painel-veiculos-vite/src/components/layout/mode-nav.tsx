import { useNavigate, useLocation } from 'react-router-dom';
import { Box, ToggleButton, ToggleButtonGroup, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import {
  TableChart, FlightTakeoff, GridView, ViewKanban,
  Dashboard, Warning, DarkMode, LightMode,
  PlayArrow, Pause, SkipNext, EventNote, EditNote,
} from '@mui/icons-material';
import { useThemeStore } from '@/stores/theme-store';

interface ModeNavProps {
  rodizio?: {
    isPaused: boolean;
    setIsPaused: (v: boolean) => void;
    goToNext: () => void;
    currentIndex: number;
    totalModos: number;
  };
  totalVeiculos?: number;
  totalSituacoes?: number;
}

const MODES = [
  { path: '/grid', label: 'DataGrid', Icon: TableChart },
  { path: '/aeroporto', label: 'Aeroporto', Icon: FlightTakeoff },
  { path: '/status', label: 'Mosaico', Icon: GridView },
  { path: '/kanban', label: 'Kanban', Icon: ViewKanban },
  { path: '/kpi', label: 'KPI', Icon: Dashboard },
  { path: '/urgentes', label: 'Urgentes', Icon: Warning },
  { path: '/quadro', label: 'Quadro', Icon: EventNote },
  { path: '/crud', label: 'CRUD', Icon: EditNote },
];

export function ModeNav({ rodizio, totalVeiculos, totalSituacoes }: ModeNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.5, py: 0.75,
      bgcolor: 'background.paper',
      borderBottom: 1, borderColor: 'divider',
    }}>
      {/* Logo / Title */}
      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em', mr: 1 }}>
        FROTA
      </Typography>

      {/* Mode selector */}
      <ToggleButtonGroup
        value={location.pathname}
        exclusive
        onChange={(_, val) => { if (val) navigate(val); }}
        size="small"
        sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.5, fontSize: '0.7rem', gap: 0.5 } }}
      >
        {MODES.map(({ path, label, Icon }) => (
          <ToggleButton key={path} value={path}>
            <Icon sx={{ fontSize: 16 }} />
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Rodizio controls */}
      {rodizio && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          <Tooltip title={rodizio.isPaused ? 'Iniciar rodizio' : 'Pausar rodizio'}>
            <IconButton size="small" onClick={() => rodizio.setIsPaused(!rodizio.isPaused)}>
              {rodizio.isPaused ? <PlayArrow sx={{ fontSize: 18 }} /> : <Pause sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Proximo modo">
            <IconButton size="small" onClick={rodizio.goToNext}>
              <SkipNext sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
            {rodizio.currentIndex + 1}/{rodizio.totalModos}
          </Typography>
        </Box>
      )}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Stats */}
      {totalVeiculos !== undefined && (
        <Chip label={`${totalVeiculos} veiculos`} size="small" color="primary" sx={{ fontWeight: 600, height: 24 }} />
      )}
      {totalSituacoes !== undefined && totalSituacoes > 0 && (
        <Chip label={`${totalSituacoes} situacoes`} size="small" variant="outlined" sx={{ fontWeight: 600, height: 24 }} />
      )}

      {/* Theme toggle */}
      <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
        <IconButton onClick={toggleTheme} size="small">
          {mode === 'light' ? <DarkMode sx={{ fontSize: 18 }} /> : <LightMode sx={{ fontSize: 18 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
