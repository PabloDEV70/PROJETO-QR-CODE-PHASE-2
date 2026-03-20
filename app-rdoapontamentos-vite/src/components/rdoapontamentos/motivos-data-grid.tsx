import { useMemo } from 'react';
import type { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CrudDataGrid } from '@/components/shared/crud-data-grid';
import type { RdoMotivo } from '@/types/rdo-types';

const WT_LABELS: Record<string, string> = {
  wrenchTime: 'Wrench Time',
  desloc: 'Deslocamento',
  espera: 'Espera',
  buro: 'Burocracia',
  trein: 'Treinamento',
  pausas: 'Pausas',
  externos: 'Externos',
};

const WT_COLORS: Record<string, 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error' | 'default'> = {
  wrenchTime: 'primary',
  desloc: 'info',
  espera: 'warning',
  buro: 'secondary',
  trein: 'success',
  pausas: 'default',
  externos: 'error',
};

interface MotivosDataGridProps {
  rows: RdoMotivo[];
  loading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onEdit: (motivo: RdoMotivo) => void;
  onDelete: (motivo: RdoMotivo) => void;
  onAdd: () => void;
  onRefresh: () => void;
  ativo: 'S' | 'N' | '';
  onAtivoChange: (v: 'S' | 'N' | '') => void;
}

export function MotivosDataGrid({
  rows, loading, rowCount, paginationModel,
  onPaginationModelChange, sortModel, onSortModelChange,
  onEdit, onDelete, onAdd, onRefresh,
  ativo, onAtivoChange,
}: MotivosDataGridProps) {
  const columns = useMemo<GridColDef<RdoMotivo>[]>(() => [
    { field: 'RDOMOTIVOCOD', headerName: 'Cod', width: 70, type: 'number' },
    {
      field: 'SIGLA', headerName: 'Sigla', width: 110,
      renderCell: ({ row }) => (
        <Chip label={row.SIGLA} size="small" variant="outlined"
          color={row.PRODUTIVO === 'S' ? 'success' : 'warning'}
          sx={{ fontWeight: 700 }} />
      ),
    },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 200 },
    {
      field: 'PRODUTIVO', headerName: 'Produtivo', width: 130, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Chip
          icon={row.PRODUTIVO === 'S' ? <CheckCircleIcon /> : <CancelIcon />}
          label={row.PRODUTIVO === 'S' ? 'Produtivo' : 'Improdutivo'}
          size="small"
          color={row.PRODUTIVO === 'S' ? 'success' : 'error'}
          variant="outlined"
          sx={{ fontSize: 11, fontWeight: 600, '& .MuiChip-icon': { fontSize: 15 } }}
        />
      ),
    },
    {
      field: 'ATIVO', headerName: 'Status', width: 100, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Chip
          label={row.ATIVO === 'S' ? 'Ativo' : 'Inativo'}
          size="small"
          color={row.ATIVO === 'S' ? 'success' : 'default'}
          variant={row.ATIVO === 'S' ? 'filled' : 'outlined'}
          sx={{
            fontSize: 11, fontWeight: 600,
            ...(row.ATIVO === 'N' && { borderStyle: 'dashed', opacity: 0.7 }),
          }}
        />
      ),
    },
    {
      field: 'TOLERANCIA', headerName: 'Toler.(min)', width: 100, type: 'number',
      valueFormatter: (value: number | null) => value != null ? `${value} min` : '-',
    },
    {
      field: 'PENALIDADE', headerName: 'Penal.(min)', width: 100, type: 'number',
      valueFormatter: (value: number | null) => value != null ? `${value} min` : '-',
    },
    {
      field: 'WTCATEGORIA', headerName: 'Categoria', width: 140,
      valueGetter: (_value: string | null, row: RdoMotivo) => row.WTCATEGORIA ?? '',
      renderCell: ({ row }) => {
        const val = row.WTCATEGORIA;
        if (!val) return <span style={{ color: '#9e9e9e' }}>-</span>;
        return (
          <Chip
            label={WT_LABELS[val] ?? val}
            size="small"
            variant="outlined"
            color={WT_COLORS[val] ?? 'default'}
            sx={{ fontSize: 11, fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'actions', headerName: 'Acoes', width: 100, sortable: false,
      filterable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row); }} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(row); }} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [onEdit, onDelete]);

  const ativoFilter = (
    <ToggleButtonGroup
      size="small" exclusive
      value={ativo}
      onChange={(_, v) => { if (v !== null) onAtivoChange(v); }}
    >
      <ToggleButton value="">Todos</ToggleButton>
      <ToggleButton value="S">Ativos</ToggleButton>
      <ToggleButton value="N">Inativos</ToggleButton>
    </ToggleButtonGroup>
  );

  return (
    <CrudDataGrid<RdoMotivo>
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.RDOMOTIVOCOD}
      rowCount={rowCount}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      title="Motivos RDO"
      onAdd={onAdd}
      onRefresh={onRefresh}
      extraFilters={ativoFilter}
      getRowClassName={({ row }) =>
        row.ATIVO === 'N' ? 'row-inativo' : row.PRODUTIVO === 'S' ? 'row-produtivo' : 'row-improdutivo'
      }
    />
  );
}
