import { useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from '@mui/x-data-grid';
import {
  Autocomplete, Badge, Box, Divider, InputAdornment,
  ListItemIcon, ListItemText, Menu, MenuItem,
  TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import GridViewIcon from '@mui/icons-material/GridView';

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
    width: ownerState.expanded ? 240 : 'var(--trigger-width)',
    opacity: ownerState.expanded ? 1 : 0,
    transition: theme.transitions.create(['width', 'opacity']),
  }),
);

export interface LocalOption {
  valor: string;
  descricao: string;
}

export interface ArmariosGridToolbarProps {
  onRefresh?: () => void;
  /* filters */
  localArm: string;
  localOptions: LocalOption[];
  onLocalChange: (value: string) => void;
  ocupado: string;
  onOcupadoChange: (value: string) => void;
  departamento: string;
  departamentos: string[];
  onDepartamentoChange: (value: string | null) => void;
  /* print */
  selectedCount: number;
  totalCount: number;
  printCols: number;
  printing: boolean;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onPrintColsChange: (cols: number) => void;
}

export function ArmariosGridToolbar(props: ArmariosGridToolbarProps) {
  const {
    onRefresh,
    localArm, localOptions, onLocalChange,
    ocupado, onOcupadoChange,
    departamento, departamentos, onDepartamentoChange,
    selectedCount, totalCount, printCols, printing,
    onPrintSelected, onPrintAll, onPrintColsChange,
  } = props;

  const [exportOpen, setExportOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const exportRef = useRef<HTMLButtonElement>(null);
  const printRef = useRef<HTMLButtonElement>(null);

  const selectedLocal = localOptions.find((o) => o.valor === localArm) ?? null;

  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ mx: 0.5 }}>
        Armarios
      </Typography>

      <Box sx={{ flex: 1 }} />

      {/* Preset filters — right side */}
      <Autocomplete
        size="small"
        sx={{ width: 220 }}
        options={localOptions}
        value={selectedLocal}
        onChange={(_, v) => onLocalChange(v?.valor ?? '')}
        getOptionLabel={(o) => o.descricao}
        isOptionEqualToValue={(o, v) => o.valor === v.valor}
        renderInput={(p) => <TextField {...p} label="Local" />}
        clearOnEscape
      />

      <Autocomplete
        size="small"
        sx={{ width: 210, ml: 1 }}
        options={departamentos}
        value={departamento || null}
        onChange={(_, v) => onDepartamentoChange(v)}
        renderInput={(p) => <TextField {...p} label="Departamento" />}
        clearOnEscape
      />

      <ToggleButtonGroup
        value={ocupado}
        exclusive
        onChange={(_, v) => { if (v !== null) onOcupadoChange(v); }}
        size="small"
        sx={{
          ml: 1,
          '& .MuiToggleButton-root': {
            textTransform: 'none',
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
        }}
      >
        <ToggleButton value="">Todos</ToggleButton>
        <ToggleButton value="false">Livres</ToggleButton>
        <ToggleButton value="true">Ocupados</ToggleButton>
      </ToggleButtonGroup>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

      {/* Columns */}
      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>

      {/* Filters */}
      <Tooltip title="Filtros">
        <FilterPanelTrigger
          render={(filterProps, state) => (
            <ToolbarButton {...filterProps} color="default">
              <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                <FilterListIcon fontSize="small" />
              </Badge>
            </ToolbarButton>
          )}
        />
      </Tooltip>

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Export */}
      <Tooltip title="Exportar">
        <ToolbarButton
          ref={exportRef}
          aria-haspopup="true"
          aria-expanded={exportOpen ? 'true' : undefined}
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
          Imprimir tabela
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={() => setExportOpen(false)}>
          Baixar CSV
        </ExportCsv>
      </Menu>

      {/* Print etiquetas */}
      <Tooltip title="Imprimir etiquetas">
        <ToolbarButton
          ref={printRef}
          aria-haspopup="true"
          aria-expanded={printOpen ? 'true' : undefined}
          onClick={() => setPrintOpen(true)}
          color={selectedCount > 0 ? 'primary' : 'default'}
        >
          <Badge badgeContent={selectedCount || undefined} color="success" max={999}>
            <PrintIcon fontSize="small" />
          </Badge>
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={printRef.current}
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <MenuItem
          disabled={selectedCount === 0 || printing}
          onClick={() => { onPrintSelected(); setPrintOpen(false); }}
        >
          <ListItemIcon><CheckBoxIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Selecionados ({selectedCount})</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={totalCount === 0 || printing}
          onClick={() => { onPrintAll(); setPrintOpen(false); }}
        >
          <ListItemIcon><SelectAllIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Todos ({totalCount})</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled sx={{ opacity: '1 !important', py: 0.5 }}>
          <ListItemIcon><GridViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Colunas por linha
            </Typography>
          </ListItemText>
        </MenuItem>
        {[1, 2, 3, 4].map((n) => (
          <MenuItem key={n} selected={printCols === n} onClick={() => onPrintColsChange(n)}>
            <ListItemIcon>
              {printCols === n ? <CheckIcon fontSize="small" color="success" /> : null}
            </ListItemIcon>
            <ListItemText>{n} {n === 1 ? 'coluna' : 'colunas'}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Refresh */}
      {onRefresh && (
        <Tooltip title="Atualizar">
          <ToolbarButton onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      )}

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 0.5 }} />

      {/* Quick filter */}
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
              placeholder="Nome, numero ou cadeado..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: state.value ? (
                    <InputAdornment position="end">
                      <QuickFilterClear
                        edge="end"
                        size="small"
                        aria-label="Limpar busca"
                        material={{ sx: { marginRight: -0.75 } }}
                      >
                        <CancelIcon fontSize="small" />
                      </QuickFilterClear>
                    </InputAdornment>
                  ) : null,
                  ...controlProps.slotProps?.input,
                },
                ...controlProps.slotProps,
              }}
            />
          )}
        />
      </StyledQuickFilter>
    </Toolbar>
  );
}
