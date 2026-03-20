import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Toolbar, ToolbarButton, ColumnsPanelTrigger, FilterPanelTrigger,
  ExportCsv, ExportPrint,
  QuickFilter, QuickFilterControl, QuickFilterTrigger,
} from '@mui/x-data-grid';
import {
  Badge, Box, Divider, InputAdornment, ListItemText,
  Menu, MenuItem, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography, IconButton,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

type OwnerState = { expanded: boolean };

const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledSearchTrigger = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    width: 'min-content',
    height: 'min-content',
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? 'none' : 'auto',
    transition: theme.transitions.create(['opacity']),
  }),
);

const StyledSearchField = styled(TextField)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: '1 / 1',
    overflowX: 'clip',
    width: ownerState.expanded ? 220 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

export interface ApontamentoGridToolbarProps {
  onRefresh?: () => void;
  onAdd?: () => void;
  statusOs: string;
  onStatusChange: (status: string) => void;
}

const TOGGLE_SX = {
  '& .MuiToggleButton-root': {
    textTransform: 'none' as const,
    fontSize: 12,
    fontWeight: 600,
    px: 1.5,
    py: 0.5,
    lineHeight: 1.6,
    '&.Mui-selected': {
      bgcolor: 'rgba(46,125,50,0.12)',
      color: '#2e7d32',
      '&:hover': { bgcolor: 'rgba(46,125,50,0.18)' },
    },
  },
};

export function ApontamentoGridToolbar(props: ApontamentoGridToolbarProps) {
  const { onRefresh, onAdd, statusOs, onStatusChange } = props;
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);

  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ mx: 0.5 }}>
        Apontamentos
      </Typography>

      {onAdd && (
        <Tooltip title="Novo apontamento">
          <IconButton size="small" color="success" onClick={onAdd} sx={{ ml: 1 }}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      <ToggleButtonGroup
        value={statusOs}
        exclusive
        onChange={(_, v) => { if (v !== null) onStatusChange(v); }}
        size="small"
        sx={TOGGLE_SX}
      >
        <ToggleButton value="">Todos</ToggleButton>
        <ToggleButton value="MA">Manutencao</ToggleButton>
        <ToggleButton value="AN">Analise</ToggleButton>
        <ToggleButton value="AV">Aprovado</ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      <Tooltip title="Filtros">
        <FilterPanelTrigger
          render={(fp, state) => (
            <ToolbarButton {...fp} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Exportar">
        <ToolbarButton
          ref={exportRef}
          onClick={() => setExportOpen(true)}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportRef.current}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportPrint render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Imprimir</ListItemText>
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}>
          <ListItemText>Baixar CSV</ListItemText>
        </ExportCsv>
      </Menu>

      {onRefresh && (
        <Tooltip title="Atualizar">
          <ToolbarButton onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      <StyledQuickFilter>
        <QuickFilterTrigger
          render={(triggerProps, state) => (
            <Tooltip title="Buscar" enterDelay={0}>
              <StyledSearchTrigger
                {...triggerProps}
                ownerState={{ expanded: state.expanded }}
                color="default"
                aria-disabled={state.expanded}
              >
                <SearchIcon fontSize="small" />
              </StyledSearchTrigger>
            </Tooltip>
          )}
        />
        <QuickFilterControl
          render={({ ref, ...controlProps }, state) => (
            <StyledSearchField
              {...controlProps}
              ownerState={{ expanded: state.expanded }}
              inputRef={ref}
              aria-label="Buscar"
              placeholder="Buscar..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}
