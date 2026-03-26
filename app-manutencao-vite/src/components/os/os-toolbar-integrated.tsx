import { Box, Typography, Button, Stack, Paper, Chip, ToggleButtonGroup, ToggleButton, Tooltip, IconButton } from '@mui/material';
import { ViewList, ViewKanban, Add, BarChart, BarChartOutlined } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import type { OsResumo } from '@/types/os-types';

interface OsToolbarIntegratedProps {
  tab: string;
  onTabChange: (v: string) => void;
  onNewOs: () => void;
  resumo?: OsResumo;
  filters?: Record<string, string>;
  onSetFilter?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showKpis?: boolean;
  onToggleKpis?: () => void;
}

function KpiChip({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Chip size="small"
      label={<Typography sx={{ fontSize: 11, fontWeight: 600 }}>
        <Box component="span" sx={{ color: color ?? 'text.secondary', mr: 0.3 }}>{value.toLocaleString('pt-BR')}</Box>
        <Box component="span" sx={{ color: 'text.disabled' }}>{label}</Box>
      </Typography>}
      sx={{ height: 22, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '4px' }}
    />
  );
}

export function OsToolbarIntegrated({ tab, onTabChange, onNewOs, resumo, showKpis, onToggleKpis }: OsToolbarIntegratedProps) {
  const isProd = useAuthStore((s) => s.database) === 'PROD';

  return (
    <Paper elevation={0} sx={{
      display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', rowGap: 0.75,
      px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', flexShrink: 0,
    }}>
      <ToggleButtonGroup
        value={tab} exclusive
        onChange={(_, v) => { if (v) onTabChange(v); }}
        size="small"
        sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: 11, px: 1.25, py: 0.25, '&.Mui-selected': { bgcolor: 'rgba(46,125,50,0.12)', color: '#2e7d32', '&:hover': { bgcolor: 'rgba(46,125,50,0.18)' } } } }}
      >
        <ToggleButton value="lista"><ViewList sx={{ fontSize: 16, mr: 0.5 }} />Lista</ToggleButton>
        <ToggleButton value="kanban"><ViewKanban sx={{ fontSize: 16, mr: 0.5 }} />Kanban</ToggleButton>
      </ToggleButtonGroup>

      {onToggleKpis && (
        <Tooltip title={showKpis ? 'Ocultar indicadores' : 'Mostrar indicadores'}>
          <IconButton size="small" onClick={onToggleKpis} color={showKpis ? 'primary' : 'default'}>
            {showKpis ? <BarChart fontSize="small" /> : <BarChartOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      {resumo && (
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <KpiChip label="Total" value={resumo.totalOs} />
          <KpiChip label="Abertas" value={resumo.abertas} color="#f59e0b" />
          <KpiChip label="Exec." value={resumo.emExecucao} color="#0ea5e9" />
        </Stack>
      )}

      <Button variant="contained" color="success" size="small" startIcon={<Add />}
        disabled={isProd} onClick={onNewOs}
        sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, height: 32, boxShadow: 'none' }}
      >
        Nova OS
      </Button>
    </Paper>
  );
}
