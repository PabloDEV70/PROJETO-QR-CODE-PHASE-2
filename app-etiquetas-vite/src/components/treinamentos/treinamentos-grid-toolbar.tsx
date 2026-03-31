import { useState } from 'react';
import {
  Toolbar,
  ToolbarButton,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  ExportCsv,
  ExportPrint,
} from '@mui/x-data-grid';
import {
  Autocomplete, Badge, Box, Divider, InputAdornment,
  ListItemIcon, ListItemText, Menu, MenuItem,
  TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material';
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
import type { OpcaoFiltro } from '@/types/treinamento-types';

export interface TreinamentosGridToolbarProps {
  onRefresh?: () => void;
  /* filters */
  departamento: string;
  departamentos: OpcaoFiltro[];
  onDepartamentoChange: (value: OpcaoFiltro | null) => void;
  situacao: string;
  onSituacaoChange: (value: string) => void;
  termo: string;
  onTermoChange: (value: string) => void;
  /* print */
  selectedCount: number;
  totalCount: number;
  printCols: number;
  printing: boolean;
  onPrintSelected: () => void;
  onPrintAll: () => void;
  onPrintColsChange: (cols: number) => void;
}

export function TreinamentosGridToolbar(props: TreinamentosGridToolbarProps) {
  const {
    onRefresh,
    departamento,
    departamentos,
    onDepartamentoChange,
    situacao,
    onSituacaoChange,
    termo,
    onTermoChange,
    selectedCount,
    totalCount,
    printCols,
    printing,
    onPrintSelected,
    onPrintAll,
    onPrintColsChange,
  } = props;

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [printAnchorEl, setPrintAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handlePrintClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPrintAnchorEl(event.currentTarget);
  };

  const handlePrintClose = () => {
    setPrintAnchorEl(null);
  };


  const selectedDepartamento =
    departamentos.find((d) => String(d.codigo) === departamento) ?? null;

  return (
    <Toolbar>
      <Typography fontWeight="medium" sx={{ mx: 0.5 }}>
        Treinamentos
      </Typography>

      <Box sx={{ flex: 1 }} />

      {/* Preset filters — right side */}
      <Autocomplete
        size="small"
        sx={{ width: 220 }}
        options={departamentos}
        value={selectedDepartamento}
        onChange={(_, v) => onDepartamentoChange(v)}
        getOptionLabel={(o) => o.descricao}
        isOptionEqualToValue={(o, v) => o.codigo === v.codigo}
        renderInput={(p) => <TextField {...p} label="Departamento" />}
        clearOnEscape
      />

      <ToggleButtonGroup
        value={situacao}
        exclusive
        onChange={(_, v) => {
          if (v !== null) onSituacaoChange(v);
        }}
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
        <ToggleButton value="ATIVO">Ativos</ToggleButton>
        <ToggleButton value="INATIVO">Inativos</ToggleButton>
      </ToggleButtonGroup>

      <TextField
        size="small"
        sx={{ width: 240, ml: 1 }}
        value={termo}
        onChange={(e) => onTermoChange(e.target.value)}
        placeholder="Buscar por nome, cargo..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: termo ? (
            <InputAdornment position="end">
              <CancelIcon
                fontSize="small"
                sx={{ cursor: 'pointer' }}
                onClick={() => onTermoChange('')}
              />
            </InputAdornment>
          ) : null,
        }}
      />

      <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 1 }} />

      {/* Columns */}
      <Tooltip title="Colunas">
        <ColumnsPanelTrigger render={<ToolbarButton />} />
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
          aria-haspopup="true"
          aria-expanded={Boolean(exportAnchorEl)}
          onClick={handleExportClick}
        >
          <FileDownloadIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <ExportPrint render={<MenuItem />} onClick={handleExportClose}>
          Imprimir tabela
        </ExportPrint>
        <ExportCsv render={<MenuItem />} onClick={handleExportClose}>
          Baixar CSV
        </ExportCsv>
      </Menu>

      {/* Print etiquetas */}
      <Tooltip title="Imprimir etiquetas">
        <ToolbarButton
          aria-haspopup="true"
          aria-expanded={Boolean(printAnchorEl)}
          onClick={handlePrintClick}
          color={selectedCount > 0 ? 'primary' : 'default'}
        >
          <Badge badgeContent={selectedCount || undefined} color="success" max={999}>
            <PrintIcon fontSize="small" />
          </Badge>
        </ToolbarButton>
      </Tooltip>
      <Menu
        anchorEl={printAnchorEl}
        open={Boolean(printAnchorEl)}
        onClose={handlePrintClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <MenuItem
          disabled={selectedCount === 0 || printing}
          onClick={() => {
            onPrintSelected();
            handlePrintClose();
          }}
        >
          <ListItemIcon>
            <CheckBoxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Selecionados ({selectedCount})</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={totalCount === 0 || printing}
          onClick={() => {
            onPrintAll();
            handlePrintClose();
          }}
        >
          <ListItemIcon>
            <SelectAllIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Todos ({totalCount})</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled sx={{ opacity: '1 !important', py: 0.5 }}>
          <ListItemIcon>
            <GridViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Colunas por linha
            </Typography>
          </ListItemText>
        </MenuItem>
        {[1, 2, 3, 4].map((n) => (
          <MenuItem
            key={n}
            selected={printCols === n}
            onClick={() => onPrintColsChange(n)}
          >
            <ListItemIcon>
              {printCols === n ? <CheckIcon fontSize="small" color="success" /> : null}
            </ListItemIcon>
            <ListItemText>
              {n} {n === 1 ? 'coluna' : 'colunas'}
            </ListItemText>
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
    </Toolbar>
  );
}
